import { Injectable, inject } from '@angular/core';
import { Observable, Subject, filter } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { TimeSlot } from './court';

export interface CourtAvailabilityMessage {
  type: 'court.availability';
  court_id: number;
  court_name: string;
  date: string;
  slots: TimeSlot[];
}

export interface BookingEventMessage {
  type: 'booking.event';
  event: string;
  booking_id: number;
  court_id: number;
  court_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: number;
  user_username: string;
}

export interface ChatMessagePayload {
  type: 'chat.message';
  id: number;
  booking: number;
  sender_id: number;
  sender_username: string;
  sender_role?: string;
  text: string;
  created_at: string;
  read_at: string | null;
}

interface SocketEntry {
  path: string;
  ws: WebSocket | null;
  subject: Subject<Record<string, unknown>> | null;
  reconnectAttempts: number;
  closed: boolean;
  refreshing: boolean;
  retryTimer: ReturnType<typeof setTimeout> | null;
  pingTimer: ReturnType<typeof setInterval> | null;
  listeners: number;
}

const MAX_RECONNECT_MS = 15000;
const PING_INTERVAL_MS = 30000;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private auth = inject(AuthService);

  /**
   * One WebSocket per unique path so several components sharing the same
   * room (e.g. two court-detail views) reuse a single connection.
   */
  private sockets = new Map<string, SocketEntry>();

  /** Single shared `booking.event` subject for the notifications socket. */
  private bookingEvents = new Subject<BookingEventMessage>();

  /** Emits every parsed frame tagged with its path; typed helpers react to it. */
  private frames = new Subject<{ path: string; data: Record<string, unknown> }>();

  /** Per-path connection state, useful for enabling/disabling chat inputs. */
  private openStates = new Map<string, Subject<boolean>>();

  /** Observable with the open/closed state of a socket path. */
  socketState(path: string): Observable<boolean> {
    return this.openStateSubject(path).asObservable();
  }

  private openStateSubject(path: string): Subject<boolean> {
    let subject = this.openStates.get(path);
    if (!subject) {
      subject = new Subject<boolean>();
      this.openStates.set(path, subject);
    }
    return subject;
  }

  private emitOpenState(path: string, open: boolean): void {
    this.openStateSubject(path).next(open);
  }

  /** Observable with all `booking.event` frames (global, no socket per subscriber). */
  onBookingEvent(): Observable<BookingEventMessage> {
    return this.bookingEvents.asObservable();
  }

  /**
   * Keep the notifications socket in sync with auth state. Call from an
   * effect watching `AuthService.currentUser`. The socket itself stays open
   * even without subscribers; frames are pushed to `bookingEvents`.
   */
  setAuthenticated(authed: boolean): void {
    const path = '/ws/notifications/';
    if (!authed) {
      const entry = this.sockets.get(path);
      if (entry) {
        this.closeEntry(entry);
      }
      return;
    }
    this.connect(this.ensureEntry(path, { auth: true }), { auth: true });
  }

  /**
   * Live availability for a court room. Public socket (no auth needed) with a
   * snapshot on connect plus every `court.availability` broadcast.
   */
  courtAvailability(courtId: number): Observable<CourtAvailabilityMessage> {
    const path = `/ws/courts/${courtId}/`;
    return this.watch<CourtAvailabilityMessage>(path, { auth: false }).pipe(
      filter((m) => m.type === 'court.availability'),
    );
  }

  /**
   * Chat room for a booking. Authenticated socket; the backend only allows
   * participants (owner user, vendor of the court, or staff).
   */
  chatMessages(bookingId: number): Observable<ChatMessagePayload> {
    const path = `/ws/bookings/${bookingId}/chat/`;
    return this.watch<ChatMessagePayload>(path, { auth: true }).pipe(
      filter((m) => m.type === 'chat.message'),
    );
  }

  /** Send a chat message over the booking room socket (no-op if not connected). */
  sendChat(bookingId: number, text: string): void {
    const entry = this.sockets.get(`/ws/bookings/${bookingId}/chat/`);
    if (entry?.ws && entry.ws.readyState === WebSocket.OPEN) {
      entry.ws.send(JSON.stringify({ type: 'chat.send', text }));
    }
  }

  /** True when the chat socket for a booking is currently open. */
  chatOpen(bookingId: number): boolean {
    const entry = this.sockets.get(`/ws/bookings/${bookingId}/chat/`);
    return !!entry?.ws && entry.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Observe every frame for `path`, connecting the socket on first subscriber
   * and closing it when the last subscriber unsubscribes.
   */
  private watch<T>(path: string, opts: { auth: boolean }): Observable<T> {
    return new Observable<T>((subscriber) => {
      const entry = this.ensureEntry(path, opts);
      entry.listeners += 1;

      const framesSub = this.frames.subscribe((msg) => {
        if (msg.path === path) {
          subscriber.next(msg.data as T);
        }
      });

      this.connect(entry, opts);

      return () => {
        framesSub.unsubscribe();
        entry.listeners -= 1;
        if (entry.listeners <= 0) {
          this.closeEntry(entry);
        }
      };
    });
  }

  private ensureEntry(path: string, opts: { auth: boolean }): SocketEntry {
    let entry = this.sockets.get(path);
    if (!entry) {
      entry = {
        path,
        ws: null,
        subject: null,
        reconnectAttempts: 0,
        closed: false,
        refreshing: false,
        retryTimer: null,
        pingTimer: null,
        listeners: 0,
      };
      this.sockets.set(path, entry);
    }
    return entry;
  }

  private closeEntry(entry: SocketEntry): void {
    entry.closed = true;
    if (entry.retryTimer) {
      clearTimeout(entry.retryTimer);
      entry.retryTimer = null;
    }
    if (entry.pingTimer) {
      clearInterval(entry.pingTimer);
      entry.pingTimer = null;
    }
    if (entry.ws) {
      entry.ws.onclose = null;
      entry.ws.close(1000);
      entry.ws = null;
    }
    this.emitOpenState(entry.path, false);
    this.sockets.delete(entry.path);
  }

  private connect(entry: SocketEntry, opts: { auth: boolean }): void {
    if (entry.ws || entry.closed || entry.refreshing) {
      return;
    }
    const token = this.auth.getToken();
    if (opts.auth && !token) {
      // Not logged in yet; wait for the next auth-aware trigger.
      entry.closed = true;
      this.sockets.delete(entry.path);
      return;
    }
    const url = opts.auth && token ? `${environment.wsUrl}${entry.path}?token=${token}` : `${environment.wsUrl}${entry.path}`;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect(entry, opts);
      return;
    }
    entry.ws = ws;

    ws.onopen = () => {
      entry.reconnectAttempts = 0;
      this.emitOpenState(entry.path, true);
      // Application-level keepalive; the Django layer replies `pong`.
      entry.pingTimer = setInterval(() => {
        if (entry.ws?.readyState === WebSocket.OPEN) {
          entry.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as Record<string, unknown>;
        this.frames.next({ path: entry.path, data });
        if (data['type'] === 'booking.event') {
          this.bookingEvents.next(data as unknown as BookingEventMessage);
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    ws.onclose = (event) => {
      entry.ws = null;
      if (entry.pingTimer) {
        clearInterval(entry.pingTimer);
        entry.pingTimer = null;
      }
      this.emitOpenState(entry.path, false);
      if (entry.closed) {
        return;
      }
      // 4401 = our JWT expired -> refresh once, then reconnect with the new token.
      if (event.code === 4401 && !entry.refreshing) {
        entry.refreshing = true;
        this.auth.refreshToken().subscribe({
          next: (token) => {
            entry.refreshing = false;
            if (token) {
              entry.reconnectAttempts = 0;
              this.connect(entry, opts);
            } else {
              entry.closed = true;
              this.sockets.delete(entry.path);
            }
          },
          error: () => {
            entry.refreshing = false;
            entry.closed = true;
            this.sockets.delete(entry.path);
          },
        });
        return;
      }
      // Codes we should not retry: normal close, going away, policy violation.
      if ([1000, 1001, 1008].includes(event.code)) {
        entry.closed = true;
        this.sockets.delete(entry.path);
        return;
      }
      this.scheduleReconnect(entry, opts);
    };
  }

  private scheduleReconnect(entry: SocketEntry, opts: { auth: boolean }): void {
    if (entry.closed || entry.retryTimer) {
      return;
    }
    const backoff = Math.min(1000 * 2 ** entry.reconnectAttempts, MAX_RECONNECT_MS);
    entry.reconnectAttempts += 1;
    entry.retryTimer = setTimeout(() => {
      entry.retryTimer = null;
      this.connect(entry, opts);
    }, backoff + Math.random() * 300);
  }
}