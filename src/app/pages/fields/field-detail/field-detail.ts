import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService, TimeSlot, FieldAvailability } from '../../../services/field';
import { Field } from '../../../models/field';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-field-detail',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './field-detail.html',
  styleUrl: './field-detail.css',
})
export class FieldDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fieldService = inject(FieldService);

  field: Field | null = null;
  loading = true;
  selectedDate: string = '';
  availability: FieldAvailability | null = null;
  loadingSlots = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.fieldService.getFieldById(id).subscribe({
      next: (field: Field) => {
        this.field = field;
        this.loading = false;
        this.loadAvailability();
      },
      error: () => (this.loading = false),
    });

    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
  }

  loadAvailability() {
    if (!this.field) return;
    this.loadingSlots = true;
    this.fieldService.getFieldAvailability(this.field.id, this.selectedDate).subscribe({
      next: (data: FieldAvailability) => {
        this.availability = data;
        this.loadingSlots = false;
      },
      error: () => (this.loadingSlots = false),
    });
  }

  onDateChange() {
    this.loadAvailability();
  }

  bookSlot(slot: TimeSlot) {
    if (!this.field || !slot.available) return;
    this.router.navigate(['/fields', this.field.id, 'book'], {
      queryParams: { date: this.selectedDate, start: slot.start_time, end: slot.end_time },
    });
  }

  getFieldTypeLabel(type: number): string {
    const labels: Record<number, string> = { 5: '5 vs 5', 7: '7 vs 7', 11: '11 vs 11' };
    return labels[type] || `${type} vs ${type}`;
  }

  getSurfaceLabel(surface: string): string {
    const labels: Record<string, string> = { SYNTHETIC: 'Sintético', NATURAL: 'Natural', INDOOR: 'Indoor' };
    return labels[surface] || surface;
  }
}
