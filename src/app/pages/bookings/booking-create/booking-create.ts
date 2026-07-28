import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../../services/court';
import { BookingService } from '../../../services/booking';
import { ToastService } from '../../../services/toast';
import { Court } from '../../../models/court';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-booking-create',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './booking-create.html',
  styleUrl: './booking-create.css',
})
export class BookingCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  court: Court | null = null;
  booking = {
    court: 0,
    date: '',
    start_time: '',
    end_time: '',
  };
  error = '';
  loading = false;

  ngOnInit() {
    const courtId = Number(this.route.snapshot.paramMap.get('id'));
    this.booking.court = courtId;

    const qp = this.route.snapshot.queryParams;
    if (qp['date']) this.booking.date = qp['date'];
    if (qp['start']) this.booking.start_time = qp['start'];
    if (qp['end']) this.booking.end_time = qp['end'];

    this.courtService.getCourtById(courtId).subscribe({
      next: (c: Court) => (this.court = c),
      error: () => this.router.navigate(['/courts']),
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.bookingService.createBooking(this.booking).subscribe({
      next: (b: Booking) => {
        this.toast.success('toast.bookingCreated');
        this.router.navigate(['/bookings', b.id]);
      },
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
        this.toast.error('toast.bookingError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.error = Object.values(errors).flat().join(' ');
        } else {
          this.error = 'bookings.createError';
        }
      },
    });
  }
}
