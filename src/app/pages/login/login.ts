import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  credentials = { username: '', password: '' };
  error = '';
  loading = false;

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
