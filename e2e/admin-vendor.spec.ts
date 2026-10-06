import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.skip('should access admin dashboard when logged in as admin', async ({ page }) => {
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/Dashboard|Admin/i);
  });

  test.skip('should display admin stats', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin');
    await expect(page.locator('text=Total canchas')).toBeVisible();
    await expect(page.locator('text=Total reservas')).toBeVisible();
    await expect(page.locator('text=Total usuarios')).toBeVisible();
  });
});

test.describe('Admin - Court Management', () => {
  test.skip('should list courts in admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin/courts');
    await expect(page.locator('h1')).toContainText(/Canchas|Courts/i);
  });

  test.skip('should create new court', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin/courts/new');
    await expect(page.locator('h1')).toContainText(/Nueva cancha|New Court/i);

    await page.fill('input[name="name"]', 'Test Court E2E');
    await page.selectOption('select[name="sport_type"]', 'FOOTBALL');
    await page.selectOption('select[name="surface"]', 'SYNTHETIC');
    await page.fill('input[name="price_per_hour"]', '50');
    await page.fill('textarea[name="description"]', 'Test court created by E2E test');

    await page.click('button[type="submit"]:has-text("Crear")');

    await expect(page.locator('text=Cancha creada')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should edit court', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin/courts');
    const editButton = page.locator('a[href*="/edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('h1')).toContainText(/Editar|Edit/i);

      await page.fill('input[name="name"]', 'Updated Court Name');
      await page.click('button[type="submit"]:has-text("Actualizar")');

      await expect(page.locator('text=Cancha actualizada')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin - Booking Management', () => {
  test.skip('should list all bookings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin/bookings');
    await expect(page.locator('h1')).toContainText(/Reservas|Bookings/i);
  });
});

test.describe('Admin - User Management', () => {
  test.skip('should list vendors', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin/vendors');
    await expect(page.locator('h1')).toContainText(/Proveedores|Vendors/i);
  });
});

test.describe('Vendor Dashboard', () => {
  test.skip('should access vendor dashboard when logged in as vendor', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'vendor');
    await page.fill('input[id="password"]', 'vendorpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard|Panel/i);
  });

  test.skip('should manage vendor courts', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'vendor');
    await page.fill('input[id="password"]', 'vendorpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard/courts');
    await expect(page.locator('h1')).toContainText(/Mis canchas|My Courts/i);
  });

  test.skip('should manage vendor schedules', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'vendor');
    await page.fill('input[id="password"]', 'vendorpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard/schedules');
    await expect(page.locator('h1')).toContainText(/Horarios|Schedules/i);
  });

  test.skip('should manage vendor blocks', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'vendor');
    await page.fill('input[id="password"]', 'vendorpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard/blocks');
    await expect(page.locator('h1')).toContainText(/Bloqueos|Blocks/i);
  });

  test.skip('should view vendor bookings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'vendor');
    await page.fill('input[id="password"]', 'vendorpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard/bookings');
    await expect(page.locator('h1')).toContainText(/Reservas|Bookings/i);
  });
});

test.describe('Authorization Guards', () => {
  test('should redirect non-admin from admin routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'regularuser');
    await page.fill('input[id="password"]', 'userpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/courts/);
  });

  test('should redirect non-vendor from vendor routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'regularuser');
    await page.fill('input[id="password"]', 'userpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/courts/);
  });
});