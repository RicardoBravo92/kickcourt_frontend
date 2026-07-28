import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardSummary {
  total_bookings: number;
  total_revenue: number;
  bookings_last_30_days: number;
  bookings_last_7_days: number;
  active_fields: number;
  total_users: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  bookings_by_status: Record<string, number>;
  bookings_by_day: Record<string, number>;
  top_fields: Array<{ field__name: string; booking_count: number; revenue: number }>;
  top_users: Array<{ user__username: string; booking_count: number; total_spent: number }>;
  bookings_by_hour: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard/`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}stats/`);
  }

  exportCsv(filters?: { field_id?: number; status?: string; date_from?: string; date_to?: string }): string {
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
