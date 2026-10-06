import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should load login page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Iniciar sesión|Login/i);
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('input[id="username"]:invalid')).toBeTruthy();
    await expect(page.locator('input[id="password"]:invalid')).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[id="username"]', 'invalid_user');
    await page.fill('input[id="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-50, .text-red-700')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a:has-text("Regístrate")');
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.click('a:has-text("¿Olvidaste tu contraseña?")');
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should show loading state during login', async ({ page }) => {
    await page.fill('input[id="username"]', 'test');
    await page.fill('input[id="password"]', 'test');
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should load register page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Registrarse|Register/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('a:has-text("Inicia sesión")');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/my-bookings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing booking create', async ({ page }) => {
    await page.goto('/courts/1/book');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing profile', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});