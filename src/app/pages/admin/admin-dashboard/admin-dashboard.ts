import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FieldService } from '../../../services/field';
import { BookingService } from '../../../services/booking';
import { Field } from '../../../models/field';
import { Booking } from '../../../models/booking';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private fieldService = inject(FieldService);
  private bookingService = inject(BookingService);

  fields: Field[] = [];
  pendingBookings: Booking[] = [];
  loading = true;

  ngOnInit() {
    this.fieldService.getFields().subscribe({
      next: (f: Field[]) => (this.fields = f),
    });
    this.bookingService.getPendingBookings().subscribe({
      next: (b: Booking[]) => {
        this.pendingBookings = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  deleteField(id: number) {
    if (!confirm('fields.confirmDelete')) return;
    this.fieldService.deleteField(id).subscribe({
      next: () => (this.fields = this.fields.filter((f) => f.id !== id)),
    });
  }
}
