import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { debouncedSignal } from './debounced';

describe('debouncedSignal', () => {
  it('exposes the initial value immediately', () => {
    const source = signal('a');
    const value = TestBed.runInInjectionContext(() => debouncedSignal(source, 20));

    expect(value()).toBe('a');
  });

  it('only propagates the latest value after the delay', async () => {
    const source = signal('a');
    const value = TestBed.runInInjectionContext(() => debouncedSignal(source, 20));

    source.set('b');
    TestBed.tick();

    expect(value()).toBe('a');

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(value()).toBe('b');
  });
});
