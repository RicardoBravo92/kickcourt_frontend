import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);

  credentials = { username: '', password: '' };
  error = signal('');
  loading = signal(false);

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
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.authService.loadProfile();
        this.router.navigate(['/courts']);
      },
      error: (err: { error?: { detail?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'auth.wrongCredentials');
      },
    });
  }
}