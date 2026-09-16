import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CourtSchedule } from '../models/court';
import { PaginatedResponse, buildHttpParams, extractResults } from './paginated';

@Injectable({ providedIn: 'root' })
export class CourtScheduleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/court-schedules/`;

  getSchedules(courtId?: number): Observable<CourtSchedule[]> {
    return this.http
      .get<PaginatedResponse<CourtSchedule> | CourtSchedule[]>(this.apiUrl, {
        params: buildHttpParams({ court: courtId }),
      })
      .pipe(map((res) => extractResults(res)));
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
