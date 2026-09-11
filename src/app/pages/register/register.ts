import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private title = inject(Title);

  userData = {
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone_number: '',
  };
  error = signal('');
  loading = signal(false);
  usernameTaken = signal(false);
  emailTaken = signal(false);
  checkingUsername = signal(false);
  checkingEmail = signal(false);
  private usernameDebounce: ReturnType<typeof setTimeout> | undefined;
  private emailDebounce: ReturnType<typeof setTimeout> | undefined;
  private usernameCheckId = 0;
  private emailCheckId = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.usernameDebounce);
      clearTimeout(this.emailDebounce);
    });
  }

  ngOnInit() {
    this.title.setTitle('Register - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Create a KickCourt account to book soccer fields, padel courts, and more.' });
    this.meta.updateTag({ property: 'og:title', content: 'Register - KickCourt' });
    this.meta.updateTag({ property: 'og:description', content: 'Create a KickCourt account to book soccer fields, padel courts, and more.' });
    this.meta.updateTag({ property: 'og:url', content: 'https://kickcourt.com/register' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Register - KickCourt' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Create a KickCourt account to book soccer fields, padel courts, and more.' });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.authService.register(this.userData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success('toast.registerSuccess');
        this.router.navigate(['/login']);
      },
      error: (err: { error: Record<string, unknown> | string | null }) => {
        this.loading.set(false);
        this.toast.error('toast.registerError');
        this.error.set(this.extractError(err.error));
      },
    });
  }

  onUsernameChange() {
    clearTimeout(this.usernameDebounce);
    const value = this.userData.username.trim();
    if (value.length < 3) {
      this.checkingUsername.set(false);
      this.usernameTaken.set(false);
      return;
    }
    this.checkingUsername.set(true);
    this.usernameTaken.set(false);
    this.usernameDebounce = setTimeout(() => {
      this.checkAvailability({ username: value }, 'username', ++this.usernameCheckId);
    }, 500);
  }

  onEmailChange() {
    clearTimeout(this.emailDebounce);
    const value = this.userData.email.trim();
    if (!value.includes('@')) {
      this.checkingEmail.set(false);
      this.emailTaken.set(false);
      return;
    }
    this.checkingEmail.set(true);
    this.emailTaken.set(false);
    this.emailDebounce = setTimeout(() => {
      this.checkAvailability({ email: value }, 'email', ++this.emailCheckId);
    }, 500);
  }

  private checkAvailability(data: { username?: string; email?: string }, field: 'username' | 'email', requestId: number) {
    this.authService.checkAvailability(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (field === 'username') {
          if (requestId !== this.usernameCheckId) return;
          this.checkingUsername.set(false);
          this.usernameTaken.set(res.username_available === false);
        } else {
          if (requestId !== this.emailCheckId) return;
          this.checkingEmail.set(false);
          this.emailTaken.set(res.email_available === false);
        }
      },
      error: () => {
        if (field === 'username' && requestId === this.usernameCheckId) {
          this.checkingUsername.set(false);
        }
        if (field === 'email' && requestId === this.emailCheckId) {
          this.checkingEmail.set(false);
        }
      },
    });
  }

  private extractError(err: Record<string, unknown> | string | null | undefined): string {
    if (!err) {
      return 'auth.registerFailed';
    }
    if (typeof err === 'string') {
      return err;
    }
    const parts: string[] = [];
    for (const value of Object.values(err)) {
      this.collectStrings(value, parts);
    }
    return parts.length ? parts.join(' ') : 'auth.registerFailed';
  }

  private collectStrings(value: unknown, out: string[]): void {
    if (value == null) return;
    if (typeof value === 'string') {
      out.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        this.collectStrings(item, out);
      }
    } else if (typeof value === 'object') {
      for (const v of Object.values(value as Record<string, unknown>)) {
        this.collectStrings(v, out);
      }
    }
  }
}