import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnInit {
  private http = inject(HttpClient);
  private meta = inject(Meta);
  private title = inject(Title);

  email = '';
  error = '';
  success = '';
  loading = false;

  ngOnInit() {
    this.title.setTitle('Forgot Password - KickCourt');
    this.meta.updateTag({ name: 'description', content: 'Reset your KickCourt password.' });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post(`${environment.apiUrl}/password/forgot/`, { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'If an account with this email exists, a reset link has been sent.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Something went wrong. Please try again.';
      },
    });
  }
}
