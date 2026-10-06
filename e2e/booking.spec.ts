import { test, expect } from '@playwright/test';

test.describe('Court Detail and Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/courts/1');
  });

  test('should load court detail page', async ({ page }) => {
    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('text=Ver detalle')).toBeVisible();
  });

  test('should display court information', async ({ page }) => {
    await expect(page.locator('text=Precio por hora')).toBeVisible();
    await expect(page.locator('text=Reservar')).toBeVisible();
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.click('a:has-text("Reservar"), button:has-text("Reservar")');
    await expect(page).toHaveURL(/\/courts\/1\/book/);
  });
});

test.describe('Booking Creation Flow (requires auth)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Note: These tests require a valid test user
    // In CI, you would set up test users via API or seed data
  });

  test.skip('should create a booking when logged in', async ({ page }) => {
    // This test requires authentication
    // Login first
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    // Navigate to a court and book
    await page.goto('/courts/1/book');
    await expect(page.locator('h1')).toContainText(/Crear reserva|Booking/i);

    // Fill booking form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.fill('input[type="date"]', dateStr);
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '11:00');

    await page.click('button[type="submit"]:has-text("Confirmar")');

    // Should redirect to booking detail
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    await expect(page.locator('text=Reserva confirmada')).toBeVisible();
  });

  test.skip('should show error for past date', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/courts/1/book');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    await page.fill('input[type="date"]', dateStr);
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '11:00');

    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-50, .text-red-700')).toBeVisible();
  });

  test.skip('should show error for invalid time range', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/courts/1/book');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.fill('input[type="date"]', dateStr);
    await page.fill('input[name="start_time"]', '11:00');
    await page.fill('input[name="end_time"]', '10:00'); // End before start

    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-50, .text-red-700')).toBeVisible();
  });
});

test.describe('My Bookings Page (requires auth)', () => {
  test.skip('should display user bookings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/my-bookings');
    await expect(page.locator('h1')).toContainText(/Mis reservas|My Bookings/i);
  });

  test.skip('should navigate to booking detail', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/courts/);

    await page.goto('/my-bookings');
    const firstBookingLink = page.locator('a[href^="/bookings/"]').first();
    if (await firstBookingLink.isVisible()) {
      await firstBookingLink.click();
      await expect(page).toHaveURL(/\/bookings\/\d+/);
    }
  });
});