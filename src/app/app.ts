import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navbar } from './components/navbar/navbar';
import { Toast } from './components/toast/toast';
import { AuthService } from './services/auth';
import { RealtimeService, BookingEventMessage } from './services/realtime';
import { ToastService } from './services/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private realtime = inject(RealtimeService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Open/close the notifications socket when the auth state changes.
    effect(() => {
      this.realtime.setAuthenticated(!!this.authService.currentUser());
    });
  }

  ngOnInit() {
    this.authService.loadProfile();
    this.realtime
      .onBookingEvent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.notifyBookingEvent(event));
  }

  private notifyBookingEvent(event: BookingEventMessage) {
    // Skip events this device caused; the UI already reflects those optimistically.
    if (event.user_id === this.authService.currentUser()?.id && event.event === 'created') {
      return;
    }
    const map: Record<string, { key: string; type: 'success' | 'info' | 'error' }> = {
      confirmed: { key: 'toast.bookingConfirmed', type: 'success' },
      completed: { key: 'toast.bookingCompleted', type: 'success' },
      cancelled: { key: 'toast.bookingCancelled', type: 'info' },
      restored: { key: 'toast.bookingRestored', type: 'success' },
      updated: { key: 'toast.bookingUpdated', type: 'info' },
      created: { key: 'toast.bookingCreated', type: 'info' },
    };
    const item = map[event.event] || { key: 'toast.bookingUpdated', type: 'info' as const };
    this.toast.show(item.key, item.type);
  }
}
