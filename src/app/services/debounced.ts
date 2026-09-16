import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

export function debouncedSignal<T>(source: Signal<T>, delayMs = 300): Signal<T> {
  return toSignal(toObservable(source).pipe(debounceTime(delayMs)), {
    initialValue: source(),
  });
}
