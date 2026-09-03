import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);

  uid = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  ngOnInit() {
    this.title.setTitle('Reset Password - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Set a new password for your KickCourt account.' });
    this.uid = this.route.snapshot.queryParamMap.get('uid') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.uid || !this.token) {
      this.error = 'Invalid reset link. Please request a new one.';
    }
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post(`${environment.apiUrl}/password/reset/`, {
      uid: this.uid,
      token: this.token,
      new_password: this.newPassword,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password has been reset successfully. You can now log in.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Something went wrong. Please try again.';
      },
    });
  }
}
