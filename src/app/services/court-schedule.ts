import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CourtSchedule } from '../models/court';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class CourtScheduleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/court-schedules/`;

  getSchedules(courtId?: number): Observable<CourtSchedule[]> {
    let url = this.apiUrl;
    if (courtId) {
      url += `?court=${courtId}`;
    }
    return this.http.get<PaginatedResponse<CourtSchedule> | CourtSchedule[]>(url).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  createSchedule(schedule: Partial<CourtSchedule>): Observable<CourtSchedule> {
    return this.http.post<CourtSchedule>(this.apiUrl, schedule);
  }

  updateSchedule(id: number, schedule: Partial<CourtSchedule>): Observable<CourtSchedule> {
    return this.http.put<CourtSchedule>(`${this.apiUrl}${id}/`, schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
