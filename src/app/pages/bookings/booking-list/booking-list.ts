import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../../../services/booking';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-booking-list',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingList implements OnInit {
  private bookingService = inject(BookingService);
  private destroyRef = inject(DestroyRef);

  bookings = signal<Booking[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.bookingService.getMyBookings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bookings: Booking[]) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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