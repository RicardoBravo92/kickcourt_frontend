import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private meta = inject(Meta);
  private title = inject(Title);

  credentials = { username: '', password: '' };
  error = '';
  loading = false;

  ngOnInit() {
    this.title.setTitle('Login - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Log in to your KickCourt account to book soccer fields and padel courts.' });
    this.meta.updateTag({ property: 'og:title', content: 'Login - KickCourt' });
    this.meta.updateTag({ property: 'og:description', content: 'Log in to your KickCourt account to book soccer fields and padel courts.' });
    this.meta.updateTag({ property: 'og:url', content: 'https://kickcourt.com/login' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Login - KickCourt' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Log in to your KickCourt account to book soccer fields and padel courts.' });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.authService.loadProfile();
        this.toast.success('toast.loginSuccess');
        this.router.navigate(['/fields']);
      },
      error: (err: { error?: { detail?: string } }) => {
        this.loading = false;
        this.error = err.error?.detail || 'auth.wrongCredentials';
        this.toast.error('toast.loginError');
      },
    });
  }
}
