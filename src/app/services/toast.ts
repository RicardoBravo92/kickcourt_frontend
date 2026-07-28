import { Injectable, inject, signal } from '@angular/core';
import { I18nService } from './i18n';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private i18n = inject(I18nService);
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = ++this.counter;
    const translated = this.i18n.translate(message);
    this.toasts.update((t: Toast[]) => [...t, { id, message: translated, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error', 6000);
  }

  info(message: string) {
    this.show(message, 'info');
  }

  dismiss(id: number) {
    this.toasts.update((t: Toast[]) => t.filter((toast: Toast) => toast.id !== id));
  }
}
