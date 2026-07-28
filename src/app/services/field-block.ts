import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FieldBlock } from '../models/field';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class FieldBlockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/field-blocks/`;

  getBlocks(fieldId?: number): Observable<FieldBlock[]> {
    let url = this.apiUrl;
    if (fieldId) {
      url += `?field_id=${fieldId}`;
    }
    return this.http.get<PaginatedResponse<FieldBlock> | FieldBlock[]>(url).pipe(
      map(res => Array.isArray(res) ? res : res.results)
    );
  }

  createBlock(block: Partial<FieldBlock>): Observable<FieldBlock> {
    return this.http.post<FieldBlock>(this.apiUrl, block);
  }

  updateBlock(id: number, block: Partial<FieldBlock>): Observable<FieldBlock> {
    return this.http.put<FieldBlock>(`${this.apiUrl}${id}/`, block);
  }

  deleteBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
