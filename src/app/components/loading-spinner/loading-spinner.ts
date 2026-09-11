import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  imports: [],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinner {
  size = input<'sm' | 'md' | 'lg'>('md');
}
