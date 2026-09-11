import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-bookings',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBookings implements OnInit {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  bookings = signal<Booking[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.bookingService.getBookings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b: Booking[]) => {
        this.bookings.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancelBooking(id: number) {
    this.bookingService.cancelBooking(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.bookingCancelled');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.cancelError'),
    });
  }

  completeBooking(id: number) {
    this.bookingService.completeBooking(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.bookingCompleted');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.completeError'),
    });
  }

  confirmBooking(id: number) {
    this.bookingService.confirmBooking(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.bookingConfirmed');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.confirmError'),
    });
  }

  restoreBooking(id: number) {
    this.bookingService.restoreBooking(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.bookingRestored');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.restoreError'),
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