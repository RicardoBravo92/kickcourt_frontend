import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private title = inject(Title);

  email = '';
  error = signal('');
  success = signal('');
  loading = signal(false);

  ngOnInit() {
    this.title.setTitle('Forgot Password - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Reset your KickCourt password.' });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.post(`${environment.apiUrl}/password/forgot/`, { email: this.email }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('auth.forgotPasswordSuccess');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'auth.somethingWentWrong');
      },
    });
  }
}