import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { injectQuery } from './query';

describe('injectQuery', () => {
  it('loads data and exposes a success status', () => {
    const request = signal('a');
    const query = TestBed.runInInjectionContext(() =>
      injectQuery(
        () => request(),
        (value: string) => of(`result-${value}`),
      ),
    );

    expect(query.status()).toBe('idle');
    expect(query.loading()).toBe(false);

    TestBed.tick();

    expect(query.data()).toBe('result-a');
    expect(query.status()).toBe('success');
    expect(query.loading()).toBe(false);
  });

  it('refetches when params change', () => {
    const request = signal(1);
    const query = TestBed.runInInjectionContext(() =>
      injectQuery(
        () => request(),
        (id: number) => of(id * 2),
      ),
    );

    TestBed.tick();
    expect(query.data()).toBe(2);

    request.set(5);
    TestBed.tick();
    expect(query.data()).toBe(10);
  });

  it('normalizes load errors', () => {
    const query = TestBed.runInInjectionContext(() =>
      injectQuery(
        () => 1,
        () => throwError(() => new HttpErrorResponse({ status: 403, error: { detail: 'Nope' } })),
      ),
    );

    TestBed.tick();

    expect(query.status()).toBe('error');
    expect(query.loading()).toBe(false);
    expect(query.error()?.status).toBe(403);
    expect(query.error()?.message).toBe('Nope');
  });

  it('stays idle while disabled', () => {
    const enabled = signal(false);
    const query = TestBed.runInInjectionContext(() =>
      injectQuery(
        () => 1,
        () => of('value'),
        { enabled: () => enabled() },
      ),
    );

    TestBed.tick();

    expect(query.status()).toBe('idle');
    expect(query.data()).toBeUndefined();
  });

  it('reloads on demand', () => {
    let calls = 0;
    const query = TestBed.runInInjectionContext(() =>
      injectQuery(
        () => 1,
        () => {
          calls += 1;
          return of(calls);
        },
      ),
    );

    TestBed.tick();
    expect(query.data()).toBe(1);

    query.reload();
    TestBed.tick();

    expect(query.data()).toBe(2);
    expect(calls).toBe(2);
  });
});
