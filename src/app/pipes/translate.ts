import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n';

@Pipe({
  name: 'translate',
  pure: false,
})
@Injectable()
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string): string {
    this.i18n.lang();
    return this.i18n.translate(key);
  }
}