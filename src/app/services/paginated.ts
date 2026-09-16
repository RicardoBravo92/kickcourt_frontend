import { HttpParams } from '@angular/common/http';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function extractResults<T>(response: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.results;
}

export function buildHttpParams(filters?: object | null): HttpParams {
  let params = new HttpParams();
  if (!filters) return params;

  for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
