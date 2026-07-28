import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_bookings: number;
  month_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  month_revenue: number;
  total_courts: number;
  active_courts: number;
  bookings_by_month: Array<{ month: string; count: number }>;
  top_users: Array<{ id: number; username: string; booking_count: number }>;
  booking_stats: Record<string, number>;
  court_stats: { total: number; active: number };
}

export interface VendorDashboard {
  total_courts: number;
  total_bookings: number;
  month_bookings: number;
  total_revenue: number;
  month_commission: number;
  pending_approvals: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard/`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}stats/`);
  }

  exportCsv(filters?: { status?: string; date_from?: string; date_to?: string }): string {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return `${this.apiUrl}export/csv/?${params.toString()}`;
  }
}
