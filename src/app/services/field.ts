import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Field } from '../models/field';

export interface FieldFilters {
  field_type?: 5 | 7 | 11;
  surface?: 'SYNTHETIC' | 'NATURAL' | 'INDOOR';
  is_active?: boolean;
  search?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface FieldAvailability {
  field_id: number;
  field_name: string;
  date: string;
  price_per_hour: string;
  slots: TimeSlot[];
}

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/fields/`;

  getFields(filters?: FieldFilters): Observable<Field[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedResponse<Field> | Field[]>(this.apiUrl, { params }).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  getFieldById(id: number): Observable<Field> {
    return this.http.get<Field>(`${this.apiUrl}${id}/`);
  }

  getFieldAvailability(id: number, date: string): Observable<FieldAvailability> {
    return this.http.get<FieldAvailability>(`${this.apiUrl}${id}/availability/`, { params: { date } });
  }

  createField(field: Partial<Field>): Observable<Field> {
    return this.http.post<Field>(this.apiUrl, field);
  }

  updateField(id: number, field: Partial<Field>): Observable<Field> {
    return this.http.put<Field>(`${this.apiUrl}${id}/`, field);
  }

  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  restoreField(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/restore/`, {});
  }

  getDeletedFields(): Observable<Field[]> {
    return this.http.get<PaginatedResponse<Field> | Field[]>(`${this.apiUrl}deleted/`).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }
}
