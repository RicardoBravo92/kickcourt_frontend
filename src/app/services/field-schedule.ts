import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FieldSchedule, FieldBlock } from '../models/field';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class FieldScheduleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/field-schedules/`;

  getSchedules(fieldId?: number): Observable<FieldSchedule[]> {
    let url = this.apiUrl;
    if (fieldId) {
      url += `?field_id=${fieldId}`;
    }
    return this.http.get<PaginatedResponse<FieldSchedule> | FieldSchedule[]>(url).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  createSchedule(schedule: Partial<FieldSchedule>): Observable<FieldSchedule> {
    return this.http.post<FieldSchedule>(this.apiUrl, schedule);
  }

  updateSchedule(id: number, schedule: Partial<FieldSchedule>): Observable<FieldSchedule> {
    return this.http.put<FieldSchedule>(`${this.apiUrl}${id}/`, schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  bulkCreateSchedules(schedules: Partial<FieldSchedule>[]): Observable<FieldSchedule[]> {
    return this.http.post<FieldSchedule[]>(`${this.apiUrl}bulk/`, schedules);
  }
}
