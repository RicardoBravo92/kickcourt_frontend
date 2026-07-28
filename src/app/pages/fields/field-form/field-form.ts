import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../../services/field';
import { ToastService } from '../../../services/toast';
import { Field } from '../../../models/field';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-field-form',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './field-form.html',
  styleUrl: './field-form.css',
})
export class FieldForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fieldService = inject(FieldService);
  private toast = inject(ToastService);

  field: Partial<Field> = {
    name: '',
    field_type: 5,
    surface: 'SYNTHETIC',
    price_per_hour: 0,
    is_active: true,
    description: '',
  };
  isEdit = false;
  fieldId = 0;
  error = '';
  loading = false;

  fieldTypes = [
    { value: 5, label: '5 vs 5' },
    { value: 7, label: '7 vs 7' },
    { value: 11, label: '11 vs 11' },
  ];

  surfaces = [
    { value: 'SYNTHETIC', label: 'Sintético' },
    { value: 'NATURAL', label: 'Natural' },
    { value: 'INDOOR', label: 'Indoor' },
  ];

  ngOnInit() {
    this.fieldId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.fieldId) {
      this.isEdit = true;
      this.fieldService.getFieldById(this.fieldId).subscribe({
        next: (f: Field) => (this.field = f),
        error: () => this.router.navigate(['/admin']),
      });
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const obs = this.isEdit
      ? this.fieldService.updateField(this.fieldId, this.field)
      : this.fieldService.createField(this.field);

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'toast.fieldUpdated' : 'toast.fieldCreated');
        this.router.navigate(['/admin']);
      },
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
        this.toast.error('toast.fieldError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.error = Object.values(errors).flat().join(' ');
        } else {
          this.error = 'fields.saveError';
        }
      },
    });
  }
}
