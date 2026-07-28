import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);

  profile: User = { username: '' };
  loading = true;
  saving = false;
  profileSuccess = '';
  profileError = '';

  oldPassword = '';
  newPassword = '';
  newPasswordConfirm = '';
  savingPassword = false;
  passwordSuccess = '';
  passwordError = '';

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (user: User) => {
        this.profile = user;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  saveProfile() {
    this.saving = true;
    this.profileSuccess = '';
    this.profileError = '';
    this.authService.updateProfile({
      email: this.profile.email,
      phone_number: this.profile.phone_number,
    }).subscribe({
      next: (user: User) => {
        this.profile = user;
        this.saving = false;
        this.profileSuccess = 'profile.updateSuccess';
      },
      error: (err: { error: Record<string, unknown> }) => {
        this.saving = false;
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.profileError = Object.values(errors).flat().join(' ');
        } else {
          this.profileError = 'common.error';
        }
      },
    });
  }

  changePassword() {
    this.savingPassword = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    if (this.newPassword !== this.newPasswordConfirm) {
      this.savingPassword = false;
      this.passwordError = 'profile.passwordMismatch';
      return;
    }

    this.authService.changePassword({
      old_password: this.oldPassword,
      new_password: this.newPassword,
      new_password_confirm: this.newPasswordConfirm,
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordSuccess = 'profile.passwordSuccess';
        this.oldPassword = '';
        this.newPassword = '';
        this.newPasswordConfirm = '';
      },
      error: (err: { error: Record<string, unknown> }) => {
        this.savingPassword = false;
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.passwordError = Object.values(errors).flat().join(' ');
        } else {
          this.passwordError = 'common.error';
        }
      },
    });
  }
}
