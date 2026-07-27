import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../../services/field';
import { BookingService } from '../../../services/booking';
import { Field } from '../../../models/field';
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
  private fieldService = inject(FieldService);
  private bookingService = inject(BookingService);

  field: Field | null = null;
  booking = {
    field: 0,
    date: '',
    start_time: '',
    end_time: '',
  };
  error = '';
  loading = false;

  ngOnInit() {
    const fieldId = Number(this.route.snapshot.paramMap.get('id'));
    this.booking.field = fieldId;

    const qp = this.route.snapshot.queryParams;
    if (qp['date']) this.booking.date = qp['date'];
    if (qp['start']) this.booking.start_time = qp['start'];
    if (qp['end']) this.booking.end_time = qp['end'];

    this.fieldService.getFieldById(fieldId).subscribe({
      next: (f: Field) => (this.field = f),
      error: () => this.router.navigate(['/fields']),
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.bookingService.createBooking(this.booking).subscribe({
      next: (b: Booking) => this.router.navigate(['/bookings', b.id]),
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
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
