import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-bookings',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
})
export class AdminBookings implements OnInit {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  bookings: Booking[] = [];
  loading = true;

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (b: Booking[]) => {
        this.bookings = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  cancelBooking(id: number) {
    this.bookingService.cancelBooking(id).subscribe({
      next: () => {
        this.toast.success('toast.bookingCancelled');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.cancelError'),
    });
  }

  restoreBooking(id: number) {
    this.bookingService.restoreBooking(id).subscribe({
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
