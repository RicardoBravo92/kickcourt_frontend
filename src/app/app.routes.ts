import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'fields', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'fields', loadComponent: () => import('./pages/fields/field-list/field-list').then(m => m.FieldList) },
  { path: 'fields/:id', loadComponent: () => import('./pages/fields/field-detail/field-detail').then(m => m.FieldDetail) },
  { path: 'fields/:id/book', loadComponent: () => import('./pages/bookings/booking-create/booking-create').then(m => m.BookingCreate), canActivate: [authGuard] },
  { path: 'my-bookings', loadComponent: () => import('./pages/bookings/booking-list/booking-list').then(m => m.BookingList), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [authGuard] },
  { path: 'bookings/:id', loadComponent: () => import('./pages/bookings/booking-detail/booking-detail').then(m => m.BookingDetail), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard), canActivate: [authGuard, adminGuard] },
  { path: 'admin/bookings', loadComponent: () => import('./pages/admin/admin-bookings/admin-bookings').then(m => m.AdminBookings), canActivate: [authGuard, adminGuard] },
  { path: 'admin/fields/new', loadComponent: () => import('./pages/fields/field-form/field-form').then(m => m.FieldForm), canActivate: [authGuard, adminGuard] },
  { path: 'admin/fields/:id/edit', loadComponent: () => import('./pages/fields/field-form/field-form').then(m => m.FieldForm), canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'fields' },
];
