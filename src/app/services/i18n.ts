import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Lang = 'es' | 'en';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private http = inject(HttpClient);
  translations = signal<Record<string, unknown>>({});
  private _lang = signal<Lang>((typeof localStorage !== 'undefined' ? (localStorage.getItem('lang') as Lang) : null) || 'es');

  lang = this._lang.asReadonly();

  constructor() {
    this.loadTranslations(this._lang());
  }

  setLang(lang: Lang) {
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
    this.loadTranslations(lang);
  }

  toggleLang() {
    this.setLang(this._lang() === 'es' ? 'en' : 'es');
  }

  private loadTranslations(lang: Lang) {
    this.http.get<Record<string, unknown>>(`assets/i18n/${lang}.json`).subscribe({
      next: (data) => this.translations.set(data),
      error: () => this.translations.set({}),
    });
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: unknown = this.translations();
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return typeof value === 'string' ? value : key;
  }
}
