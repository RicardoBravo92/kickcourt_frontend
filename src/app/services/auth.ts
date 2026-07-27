import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User, UserRole } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  currentUser = signal<User | null>(null);

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.loadProfile();
      })
    );
  }

  register(userData: User & { password: string; password_confirm: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register/`, userData);
  }

  refreshToken(): Observable<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      this.logout();
      return of('');
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.asObservable().pipe(
        switchMap(token => of(token || ''))
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return new Observable<string>(observer => {
      this.http.post<{ access: string }>(`${this.apiUrl}/auth/refresh/`, { refresh }).subscribe({
        next: (response) => {
          localStorage.setItem('access_token', response.access);
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(response.access);
          observer.next(response.access);
          observer.complete();
        },
        error: () => {
          this.refreshTokenInProgress = false;
          this.logout();
          observer.next('');
          observer.complete();
        }
      });
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  loadProfile(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUser.set(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        id: payload.user_id,
        username: payload.username || '',
        role: payload.role as UserRole,
        email: payload.email,
      });
    } catch {
      this.currentUser.set(null);
    }
  }

  getUserRole(): UserRole | null {
    const user = this.currentUser();
    return user?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
  }
}
