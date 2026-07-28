import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking } from '../models/booking';

export interface BookingFilters {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  date?: string;
  field?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/bookings/`;

  private extractResults<T>(res: PaginatedResponse<T> | T[]): T[] {
    return Array.isArray(res) ? res : res.results;
  }

  getBookings(filters?: BookingFilters): Observable<Booking[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedResponse<Booking> | Booking[]>(this.apiUrl, { params }).pipe(
      map(res => this.extractResults(res))
    );
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}${id}/`);
  }

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  cancelBooking(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/cancel/`, {});
  }

  completeBooking(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/complete/`, {});
  }

  restoreBooking(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/restore/`, {});
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}my_bookings/`).pipe(
      map(res => this.extractResults(res))
    );
  }

  getPendingBookings(): Observable<Booking[]> {
    return this.http.get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}pending/`).pipe(
      map(res => this.extractResults(res))
    );
  }

  getDeletedBookings(): Observable<Booking[]> {
    return this.http.get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}deleted/`).pipe(
      map(res => this.extractResults(res))
    );
  }
}
