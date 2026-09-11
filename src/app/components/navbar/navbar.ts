import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { I18nService } from '../../services/i18n';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  i18n = inject(I18nService);
  private authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);

  user = this.authService.currentUser;
  isLoggedIn = computed(() => this.user() !== null);
  isAdminOrVendor = computed(() => this.user()?.role === 'ADMIN' || this.user()?.role === 'VENDOR');
  isAdmin = computed(() => this.user()?.role === 'ADMIN');

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.menuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}