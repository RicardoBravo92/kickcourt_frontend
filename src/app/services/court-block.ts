import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CourtBlock } from '../models/court';
import { PaginatedResponse, buildHttpParams, extractResults } from './paginated';

@Injectable({ providedIn: 'root' })
export class CourtBlockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/court-blocks/`;

  getBlocks(courtId?: number): Observable<CourtBlock[]> {
    return this.http
      .get<PaginatedResponse<CourtBlock> | CourtBlock[]>(this.apiUrl, {
        params: buildHttpParams({ court: courtId }),
      })
      .pipe(map((res) => extractResults(res)));
  }

  createBlock(block: Partial<CourtBlock>): Observable<CourtBlock> {
    return this.http.post<CourtBlock>(this.apiUrl, block);
  }

  deleteBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
