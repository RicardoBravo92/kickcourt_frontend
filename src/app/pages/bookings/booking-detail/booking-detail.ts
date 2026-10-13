import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { RealtimeService, ChatMessagePayload } from '../../../services/realtime';
import { AuthService } from '../../../services/auth';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetail implements OnInit {
  @ViewChild('messagesScroll') messagesScroll?: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private realtime = inject(RealtimeService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  messages = signal<ChatMessagePayload[]>([]);
  chatInput = '';
  chatSending = signal(false);
  chatConnected = signal(false);
  chatLoading = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getBookingById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b: Booking) => {
        this.booking.set(b);
        this.loading.set(false);
        this.listenChat(id);
      },
      error: () => this.loading.set(false),
    });
  }

  private listenChat(bookingId: number) {
    const chatPath = `/ws/bookings/${bookingId}/chat/`;
    this.chatLoading.set(true);
    // REST history first (paginated), then realtime frames.
    this.bookingService.getMessages(bookingId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.messages.set(res.results);
        this.chatLoading.set(false);
        this.scrollToBottom();
      },
      error: () => this.chatLoading.set(false),
    });

    this.realtime.chatMessages(bookingId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (message: ChatMessagePayload) => {
        this.messages.update((list) => (list.some((m) => m.id === message.id) ? list : [...list, message]));
        this.scrollToBottom();
      },
    });

    this.realtime.socketState(chatPath).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((open) => {
      this.chatConnected.set(open);
    });
  }

  sendMessage() {
    const booking = this.booking();
    const text = this.chatInput.trim();
    if (!booking?.id || !text || this.chatSending()) return;
    this.chatSending.set(true);
    if (this.realtime.chatOpen(booking.id)) {
      // Fast path: the socket echo appends the persisted message to the thread.
      this.realtime.sendChat(booking.id, text);
      this.chatInput = '';
      this.chatSending.set(false);
      return;
    }
    // Fallback when WS is down: persist via REST.
    this.bookingService.postMessage(booking.id, text).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (message) => {
        this.messages.update((list) => (list.some((m) => m.id === message.id) ? list : [...list, message]));
        this.chatInput = '';
        this.chatSending.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.chatSending.set(false);
        this.toast.error('toast.chatSendError');
      },
    });
  }

  isMine(message: ChatMessagePayload): boolean {
    return message.sender_id === this.auth.currentUser()?.id;
  }

  formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesScroll?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  cancelBooking() {
    const booking = this.booking();
    if (!booking?.id) return;
    this.cancelling.set(true);
    this.bookingService.cancelBooking(booking.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.booking.update(b => (b ? { ...b, status: 'CANCELLED' } : b));
        this.cancelling.set(false);
        this.toast.success('toast.bookingCancelled');
      },
      error: () => {
        this.cancelling.set(false);
        this.toast.error('toast.cancelError');
      },
    });
  }

  getStatusColor(status?: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    return colors[status || ''] || 'bg-gray-100 text-gray-800';
  }
}