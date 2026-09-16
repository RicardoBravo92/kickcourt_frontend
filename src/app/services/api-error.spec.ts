import { HttpErrorResponse } from '@angular/common/http';
import { toApiError } from './api-error';

function httpError(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error, url: '/api/test/' });
}

describe('toApiError', () => {
  it('uses a detail message from a DRF error body', () => {
    const result = toApiError(httpError(404, { detail: 'No encontrado' }));
    expect(result.status).toBe(404);
    expect(result.message).toBe('No encontrado');
  });

  it('uses the first field error when no detail is present', () => {
    const result = toApiError(httpError(400, { date: ['La fecha es obligatoria'] }));
    expect(result.status).toBe(400);
    expect(result.message).toBe('La fecha es obligatoria');
  });

  it('uses a string body directly', () => {
    const result = toApiError(httpError(400, 'Datos inválidos'));
    expect(result.message).toBe('Datos inválidos');
  });

  it('falls back to a status-based message', () => {
    const result = toApiError(httpError(500, null));
    expect(result.status).toBe(500);
    expect(result.message).toContain('our end');
  });

  it('reports a network error for status 0', () => {
    const result = toApiError(httpError(0, null));
    expect(result.status).toBe(0);
    expect(result.message).toContain('Network error');
  });

  it('normalizes a plain Error', () => {
    const result = toApiError(new Error('boom'));
    expect(result.status).toBe(-1);
    expect(result.message).toBe('boom');
  });

  it('normalizes an unknown value', () => {
    const result = toApiError('weird');
    expect(result.status).toBe(-1);
    expect(result.message).toBe('weird');
  });
});
