import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { User } from '../../models/user';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  profile = signal<User | null>(null);
  loading = signal(true);
  saving = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  profileEmail = '';
  profilePhone = '';
  oldPassword = '';
  newPassword = '';
  newPasswordConfirm = '';
  savingPassword = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  ngOnInit() {
    this.authService.getProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user: User) => {
        this.profile.set(user);
        this.profileEmail = user.email || '';
        this.profilePhone = user.phone_number || '';
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveProfile() {
    this.saving.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');
    this.authService.updateProfile({
      email: this.profileEmail,
      phone_number: this.profilePhone,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user: User) => {
        this.profile.set(user);
        this.profileEmail = user.email || '';
        this.profilePhone = user.phone_number || '';
        this.saving.set(false);
        this.profileSuccess.set('profile.updateSuccess');
        this.toast.success('toast.profileUpdated');
      },
      error: (err: { error: Record<string, unknown> }) => {
        this.saving.set(false);
        this.toast.error('toast.profileError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.profileError.set(Object.values(errors).flat().join(' '));
        } else {
          this.profileError.set('common.error');
        }
      },
    });
  }

  changePassword() {
    this.savingPassword.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    if (this.newPassword !== this.newPasswordConfirm) {
      this.savingPassword.set(false);
      this.passwordError.set('profile.passwordMismatch');
      this.toast.error('toast.passwordMismatch');
      return;
    }

    this.authService.changePassword({
      old_password: this.oldPassword,
      new_password: this.newPassword,
      new_password_confirm: this.newPasswordConfirm,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('profile.passwordSuccess');
        this.toast.success('toast.passwordChanged');
        this.oldPassword = '';
        this.newPassword = '';
        this.newPasswordConfirm = '';
      },
      error: (err: { error: Record<string, unknown> }) => {
        this.savingPassword.set(false);
        this.toast.error('toast.passwordError');
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.passwordError.set(Object.values(errors).flat().join(' '));
        } else {
          this.passwordError.set('common.error');
        }
      },
    });
  }
}