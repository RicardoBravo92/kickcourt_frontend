import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  court = signal<Court | null>(null);
  booking = {
    court: 0,
    date: '',
    start_time: '',
    end_time: '',
  };
  error = signal('');
  loading = signal(false);

  ngOnInit() {
    const courtId = Number(this.route.snapshot.paramMap.get('id'));
    this.booking.court = courtId;

    const qp = this.route.snapshot.queryParams;
    if (qp['date']) this.booking.date = qp['date'];
    if (qp['start']) this.booking.start_time = qp['start'];
    if (qp['end']) this.booking.end_time = qp['end'];

    this.courtService.getCourtById(courtId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (c: Court) => this.court.set(c),
      error: () => this.router.navigate(['/courts']),
    });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.bookingService.createBooking(this.booking).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b: Booking) => {
        this.toast.success('toast.bookingCreated');
        this.router.navigate(['/bookings', b.id]);
      },
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading.set(false);
        this.toast.error('toast.bookingError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.error.set(Object.values(errors).flat().join(' '));
        } else {
          this.error.set('bookings.createError');
        }
      },
    });
  }
}