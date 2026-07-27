import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string): string {
    return this.i18n.translate(key);
  }
}
