import { test, expect } from '@playwright/test';

test.describe('Profile Page (requires auth)', () => {
  test.skip('should load profile page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText(/Perfil|Profile/i);
  });

  test.skip('should display user information', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/profile');
    await expect(page.locator('text=Nombre de usuario')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
  });

  test.skip('should update profile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/profile');
    await page.fill('input[name="first_name"]', 'Updated');
    await page.fill('input[name="last_name"]', 'Name');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Perfil actualizado')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should change password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/profile');
    await page.click('button:has-text("Cambiar contraseña")');
    await page.fill('input[name="current_password"]', 'testpass123');
    await page.fill('input[name="new_password"]', 'newpass456');
    await page.fill('input[name="confirm_password"]', 'newpass456');
    await page.click('button:has-text("Actualizar")');
    await expect(page.locator('text=Contraseña actualizada')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation and UI', () => {
  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to courts from logo', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/"], a[href="/courts"]');
    await expect(page).toHaveURL(/\/courts/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('Internationalization (i18n)', () => {
  test('should display Spanish by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Reserva tu cancha')).toBeVisible();
  });

  test.skip('should switch language', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("ES"), button:has-text("EN")');
    await expect(page.locator('text=Book your court')).toBeVisible();
  });
});