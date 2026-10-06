import { test, expect } from './fixtures';

test.describe('Authenticated User Flows', () => {
  test('should access my bookings page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/my-bookings');
    await expect(authenticatedPage.locator('h1')).toContainText(/Mis reservas|My Bookings/i);
  });

  test('should access profile page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile');
    await expect(authenticatedPage.locator('h1')).toContainText(/Perfil|Profile/i);
  });

  test('should create a booking', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/courts/1/book');
    await expect(authenticatedPage.locator('h1')).toContainText(/Crear reserva|Booking/i);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await authenticatedPage.fill('input[type="date"]', dateStr);
    await authenticatedPage.fill('input[name="start_time"]', '10:00');
    await authenticatedPage.fill('input[name="end_time"]', '11:00');

    await authenticatedPage.click('button[type="submit"]:has-text("Confirmar")');

    await expect(authenticatedPage).toHaveURL(/\/bookings\/\d+/);
  });
});

test.describe('Admin Flows', () => {
  test('should access admin dashboard', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.locator('h1')).toContainText(/Dashboard|Admin/i);
  });

  test('should list courts in admin', async ({ adminPage }) => {
    await adminPage.goto('/admin/courts');
    await expect(adminPage.locator('h1')).toContainText(/Canchas|Courts/i);
  });

  test('should list bookings in admin', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings');
    await expect(adminPage.locator('h1')).toContainText(/Reservas|Bookings/i);
  });
});

test.describe('Vendor Flows', () => {
  test('should access vendor dashboard', async ({ vendorPage }) => {
    await vendorPage.goto('/dashboard');
    await expect(vendorPage.locator('h1')).toContainText(/Dashboard|Panel/i);
  });

  test('should manage vendor courts', async ({ vendorPage }) => {
    await vendorPage.goto('/dashboard/courts');
    await expect(vendorPage.locator('h1')).toContainText(/Mis canchas|My Courts/i);
  });
});