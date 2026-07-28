import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vendor } from '../models/vendor';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/vendors/`;

  private extractResults<T>(res: PaginatedResponse<T> | T[]): T[] {
    return Array.isArray(res) ? res : res.results;
  }

  getVendors(): Observable<Vendor[]> {
    return this.http.get<PaginatedResponse<Vendor> | Vendor[]>(this.apiUrl).pipe(
      map(res => this.extractResults(res))
    );
  }

  getVendor(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}${id}/`);
  }

  approveVendor(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/approve/`, {});
  }

  rejectVendor(id: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}${id}/reject/`, {});
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}dashboard/`);
  }
}
