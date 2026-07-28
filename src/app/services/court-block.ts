import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CourtBlock } from '../models/court';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class CourtBlockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/court-blocks/`;

  getBlocks(courtId?: number): Observable<CourtBlock[]> {
    let url = this.apiUrl;
    if (courtId) {
      url += `?court=${courtId}`;
    }
    return this.http.get<PaginatedResponse<CourtBlock> | CourtBlock[]>(url).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  createBlock(block: Partial<CourtBlock>): Observable<CourtBlock> {
    return this.http.post<CourtBlock>(this.apiUrl, block);
  }

  deleteBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
