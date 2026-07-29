import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Court } from '../models/court';

export interface CourtFilters {
  sport_type?: string;
  surface?: string;
  is_active?: boolean;
  search?: string;
  vendor?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TimeSlot {
  hour: number;
  time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked' | 'closed';
}

export interface CourtAvailability {
  court_id: number;
  court_name: string;
  date: string;
  slots: TimeSlot[];
}

@Injectable({ providedIn: 'root' })
export class CourtService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/courts/`;

  private extractResults<T>(res: PaginatedResponse<T> | T[]): T[] {
    return Array.isArray(res) ? res : res.results;
  }

  getCourts(filters?: CourtFilters): Observable<Court[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedResponse<Court> | Court[]>(this.apiUrl, { params }).pipe(
      map(res => this.extractResults(res))
    );
  }

  getCourtById(id: number): Observable<Court> {
    return this.http.get<Court>(`${this.apiUrl}${id}/`);
  }

  getCourtAvailability(id: number, date: string): Observable<CourtAvailability> {
    return this.http.get<CourtAvailability>(`${this.apiUrl}${id}/availability/`, { params: { date } });
  }

  createCourt(court: Partial<Court>): Observable<Court> {
    return this.http.post<Court>(this.apiUrl, court);
  }

  updateCourt(id: number, court: Partial<Court>): Observable<Court> {
    return this.http.put<Court>(`${this.apiUrl}${id}/`, court);
  }

  deleteCourt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
