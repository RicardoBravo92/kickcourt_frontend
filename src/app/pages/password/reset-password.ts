import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private title = inject(Title);

  uid = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  error = signal('');
  success = signal('');
  loading = signal(false);

  ngOnInit() {
    this.title.setTitle('Reset Password - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Set a new password for your KickCourt account.' });
    this.uid = this.route.snapshot.queryParamMap.get('uid') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.uid || !this.token) {
      this.error.set('auth.resetLinkInvalid');
    }
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('auth.passwordsDoNotMatch');
      return;
    }

    if (this.newPassword.length < 8) {
      this.error.set('auth.passwordTooShort');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.post(`${environment.apiUrl}/password/reset/`, {
      uid: this.uid,
      token: this.token,
      new_password: this.newPassword,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('auth.passwordResetSuccess');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'auth.somethingWentWrong');
      },
    });
  }
}