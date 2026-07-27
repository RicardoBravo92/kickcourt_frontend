import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone_number: '',
  };
  error = '';
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.register(this.userData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err: { error: Record<string, unknown> | null }) => {
        this.loading = false;
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
