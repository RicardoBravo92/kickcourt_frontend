import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getBookingById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b: Booking) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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