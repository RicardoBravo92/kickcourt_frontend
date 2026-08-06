import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-vendor-bookings',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './vendor-bookings.html',
  styleUrl: './vendor-bookings.css',
})
export class VendorBookings implements OnInit {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  bookings: Booking[] = [];
  selectedCustomer: Booking | null = null;
  loading = true;

  statuses: ('PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED')[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
  filterStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | undefined;
  filterDate = '';

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookings({ status: this.filterStatus, date: this.filterDate || undefined }).subscribe({
      next: (b) => {
        this.bookings = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  viewCustomer(booking: Booking) {
    this.selectedCustomer = booking;
  }

  clearFilters() {
    this.filterStatus = undefined;
    this.filterDate = '';
    this.loadBookings();
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

  completeBooking(id: number) {
    this.bookingService.completeBooking(id).subscribe({
      next: () => {
        this.toast.success('toast.bookingCompleted');
        this.loadBookings();
      },
      error: () => this.toast.error('toast.completeError'),
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
