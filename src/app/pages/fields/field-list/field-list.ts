import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService, FieldFilters } from '../../../services/field';
import { AuthService } from '../../../services/auth';
import { Field } from '../../../models/field';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-field-list',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './field-list.html',
  styleUrl: './field-list.css',
})
export class FieldList implements OnInit {
  private fieldService = inject(FieldService);
  public authService = inject(AuthService);

  fields: Field[] = [];
  loading = true;
  filters: FieldFilters = {};
  totalCount = 0;

  activeFaqIndex: number | null = null;

  fieldTypes = [
    { value: 5 as const, label: '5 vs 5' },
    { value: 7 as const, label: '7 vs 7' },
    { value: 11 as const, label: '11 vs 11' },
  ];

  surfaces = [
    { value: 'SYNTHETIC' as const, label: 'Sintético' },
    { value: 'NATURAL' as const, label: 'Natural' },
    { value: 'INDOOR' as const, label: 'Indoor' },
  ];

  ngOnInit() {
    this.loadFields();
  }

  loadFields() {
    this.loading = true;
    this.fieldService.getFields(this.filters).subscribe({
      next: (fields: Field[]) => {
        this.fields = fields;
        this.totalCount = fields.length;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  applyFilters() {
    this.loadFields();
    this.scrollToCatalog();
  }

  clearFilters() {
    this.filters = {};
    this.loadFields();
  }

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  scrollToCatalog() {
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getFieldTypeName(type: number): string {
    return this.fieldTypes.find(ft => ft.value === type)?.label || `${type} vs ${type}`;
  }

  getSurfaceName(surface: string): string {
    return this.surfaces.find(s => s.value === surface)?.label || surface;
  }
}
