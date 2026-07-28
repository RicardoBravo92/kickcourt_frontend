import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  booking: Booking | null = null;
  loading = true;
  cancelling = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getBookingById(id).subscribe({
      next: (b: Booking) => {
        this.booking = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  cancelBooking() {
    if (!this.booking?.id) return;
    this.cancelling = true;
    this.bookingService.cancelBooking(this.booking.id).subscribe({
      next: () => {
        if (this.booking) this.booking.status = 'CANCELLED';
        this.cancelling = false;
        this.toast.success('toast.bookingCancelled');
      },
      error: () => {
        this.cancelling = false;
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
