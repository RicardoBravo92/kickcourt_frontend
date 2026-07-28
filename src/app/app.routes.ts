import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { vendorGuard } from './guards/vendor-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'courts', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'courts', loadComponent: () => import('./pages/courts/court-list/court-list').then(m => m.CourtList) },
  { path: 'courts/:id', loadComponent: () => import('./pages/courts/court-detail/court-detail').then(m => m.CourtDetail) },
  { path: 'courts/:id/book', loadComponent: () => import('./pages/bookings/booking-create/booking-create').then(m => m.BookingCreate), canActivate: [authGuard] },
  { path: 'my-bookings', loadComponent: () => import('./pages/bookings/booking-list/booking-list').then(m => m.BookingList), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [authGuard] },
  { path: 'bookings/:id', loadComponent: () => import('./pages/bookings/booking-detail/booking-detail').then(m => m.BookingDetail), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard), canActivate: [authGuard, adminGuard] },
  { path: 'admin/bookings', loadComponent: () => import('./pages/admin/admin-bookings/admin-bookings').then(m => m.AdminBookings), canActivate: [authGuard, adminGuard] },
  { path: 'admin/schedules', loadComponent: () => import('./pages/admin/admin-schedules/admin-schedules').then(m => m.AdminSchedules), canActivate: [authGuard, adminGuard] },
  { path: 'admin/blocks', loadComponent: () => import('./pages/admin/admin-blocks/admin-blocks').then(m => m.AdminBlocks), canActivate: [authGuard, adminGuard] },
  { path: 'admin/courts/new', loadComponent: () => import('./pages/courts/court-form/court-form').then(m => m.CourtForm), canActivate: [authGuard, adminGuard] },
  { path: 'admin/courts/:id/edit', loadComponent: () => import('./pages/courts/court-form/court-form').then(m => m.CourtForm), canActivate: [authGuard, adminGuard] },
  { path: 'admin/vendors', loadComponent: () => import('./pages/admin/admin-vendors/admin-vendors').then(m => m.AdminVendors), canActivate: [authGuard, adminGuard] },
  { path: 'vendor', loadComponent: () => import('./pages/vendor/vendor-dashboard/vendor-dashboard').then(m => m.VendorDashboard), canActivate: [authGuard, vendorGuard] },
  { path: 'vendor/courts', loadComponent: () => import('./pages/vendor/vendor-courts/vendor-courts').then(m => m.VendorCourts), canActivate: [authGuard, vendorGuard] },
  { path: 'vendor/courts/new', loadComponent: () => import('./pages/courts/court-form/court-form').then(m => m.CourtForm), canActivate: [authGuard, vendorGuard] },
  { path: 'vendor/courts/:id/edit', loadComponent: () => import('./pages/courts/court-form/court-form').then(m => m.CourtForm), canActivate: [authGuard, vendorGuard] },
  { path: 'fields', redirectTo: 'courts', pathMatch: 'full' },
  { path: 'admin/fields/new', redirectTo: 'admin/courts/new', pathMatch: 'full' },
  { path: '**', redirectTo: 'courts' },
];
