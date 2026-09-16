import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Observable, catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { ApiError, toApiError } from './api-error';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryResult<T> {
  readonly data: Signal<T | undefined>;
  readonly error: Signal<ApiError | null>;
  readonly loading: Signal<boolean>;
  readonly status: Signal<QueryStatus>;
  readonly reload: () => void;
}

export interface QueryOptions {
  enabled?: () => boolean;
}

type QueryEvent<T> =
  { kind: 'idle' } | { kind: 'data'; value: T } | { kind: 'error'; error: ApiError };

export function injectQuery<P, T>(
  params: () => P,
  fetcher: (params: P) => Observable<T>,
  options: QueryOptions = {},
): QueryResult<T> {
  const destroyRef = inject(DestroyRef);

  const data = signal<T | undefined>(undefined);
  const error = signal<ApiError | null>(null);
  const status = signal<QueryStatus>('idle');
  const reloadTick = signal(0);

  const enabled = options.enabled ?? (() => true);

  combineLatest([
    toObservable(computed(params)),
    toObservable(computed(enabled)),
    toObservable(reloadTick),
  ])
    .pipe(
      switchMap(([request, isEnabled]): Observable<QueryEvent<T>> => {
        if (!isEnabled) return of<QueryEvent<T>>({ kind: 'idle' });

        status.set('loading');
        error.set(null);

        return fetcher(request).pipe(
          map((value): QueryEvent<T> => ({ kind: 'data', value })),
          catchError((err: unknown) =>
            of<QueryEvent<T>>({ kind: 'error', error: toApiError(err) }),
          ),
        );
      }),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe((event) => {
      switch (event.kind) {
        case 'idle':
          status.set('idle');
          break;
        case 'data':
          data.set(event.value);
          error.set(null);
          status.set('success');
          break;
        case 'error':
          error.set(event.error);
          status.set('error');
          break;
      }
    });

  return {
    data: data.asReadonly(),
    error: error.asReadonly(),
    loading: computed(() => status() === 'loading'),
    status: status.asReadonly(),
    reload: () => reloadTick.update((tick) => tick + 1),
  };
}
