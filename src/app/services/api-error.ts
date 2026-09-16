import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Network error. Check your connection and try again.',
  400: 'Invalid request.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with the current state.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'Something went wrong on our end. Please try again.',
};

function extractMessage(error: HttpErrorResponse): string | null {
  const body: unknown = error.error;

  if (typeof body === 'string' && body.trim()) return body;

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;

    for (const key of ['detail', 'message'] as const) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value;
    }

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  return null;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    return {
      status: error.status,
      message:
        extractMessage(error) ??
        STATUS_MESSAGES[error.status] ??
        error.message ??
        'Unexpected error.',
      details: error.error,
    };
  }

  if (error instanceof Error) {
    return { status: -1, message: error.message, details: error };
  }

  return { status: -1, message: String(error), details: error };
}
