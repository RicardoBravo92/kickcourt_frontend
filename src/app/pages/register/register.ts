import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private meta = inject(Meta);
  private title = inject(Title);

  userData = {
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone_number: '',
  };
  error = '';
  loading = false;
  usernameTaken = false;
  emailTaken = false;
  checkingUsername = false;
  checkingEmail = false;
  private usernameDebounce: ReturnType<typeof setTimeout> | undefined;
  private emailDebounce: ReturnType<typeof setTimeout> | undefined;

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
    this.loading = true;
    this.error = '';
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.toast.success('toast.registerSuccess');
        this.router.navigate(['/login']);
      },
      error: (err: { error: Record<string, unknown> | string | null }) => {
        this.loading = false;
        this.toast.error('toast.registerError');
        this.error = this.extractError(err.error);
      },
    });
  }

  onUsernameChange() {
    this.usernameDebounce && clearTimeout(this.usernameDebounce);
    const value = this.userData.username.trim();
    if (value.length < 3) {
      this.checkingUsername = false;
      this.usernameTaken = false;
      return;
    }
    this.checkingUsername = true;
    this.usernameTaken = false;
    this.usernameDebounce = setTimeout(() => this.checkAvailability({ username: value }, 'username'), 500);
  }

  onEmailChange() {
    this.emailDebounce && clearTimeout(this.emailDebounce);
    const value = this.userData.email.trim();
    if (!value.includes('@')) {
      this.checkingEmail = false;
      this.emailTaken = false;
      return;
    }
    this.checkingEmail = true;
    this.emailTaken = false;
    this.emailDebounce = setTimeout(() => this.checkAvailability({ email: value }, 'email'), 500);
  }

  private checkAvailability(data: { username?: string; email?: string }, field: 'username' | 'email') {
    this.authService.checkAvailability(data).subscribe({
      next: (res) => {
        this.checkingUsername = false;
        this.checkingEmail = false;
        this.usernameTaken = field === 'username' ? res.username_available === false : this.usernameTaken;
        this.emailTaken = field === 'email' ? res.email_available === false : this.emailTaken;
      },
      error: () => {
        this.checkingUsername = false;
        this.checkingEmail = false;
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
