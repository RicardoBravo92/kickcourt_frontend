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
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
        this.toast.error('toast.registerError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.error = Object.values(errors).flat().join(' ');
        } else {
          this.error = 'auth.registerError';
        }
      },
    });
  }
}
