import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking } from '../models/booking';
import { PaginatedResponse, buildHttpParams, extractResults } from './paginated';

export interface BookingFilters {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  date?: string;
  field?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bookings/`;

  getBookings(filters?: BookingFilters): Observable<Booking[]> {
    return this.http
      .get<PaginatedResponse<Booking> | Booking[]>(this.apiUrl, {
        params: buildHttpParams(filters),
      })
      .pipe(map((res) => extractResults(res)));
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

  confirmBooking(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/confirm/`, {});
  }

  restoreBooking(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/restore/`, {});
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http
      .get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}my_bookings/`)
      .pipe(map((res) => extractResults(res)));
  }

  getPendingBookings(): Observable<Booking[]> {
    return this.http
      .get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}pending/`)
      .pipe(map((res) => extractResults(res)));
  }

  getDeletedBookings(): Observable<Booking[]> {
    return this.http
      .get<PaginatedResponse<Booking> | Booking[]>(`${this.apiUrl}deleted/`)
      .pipe(map((res) => extractResults(res)));
  }
}
