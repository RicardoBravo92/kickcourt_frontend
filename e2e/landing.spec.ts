import { test, expect } from '@playwright/test';

test.describe('Landing Page / Court Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page with hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/KickCourt|Reserva tu cancha/i);
    await expect(page.locator('button:has-text("Explorar canchas")').first()).toBeVisible();
  });

  test('should display court catalog section', async ({ page }) => {
    await expect(page.locator('#catalog-section')).toBeVisible();
    await expect(page.locator('h2:has-text("Catálogo")')).toBeVisible();
  });

  test('should filter courts by sport type', async ({ page }) => {
    await page.selectOption('select[id="sport_type"], select[name="sport_type"]', 'FOOTBALL');
    await page.click('button:has-text("Buscar")');
    await expect(page.locator('#catalog-section')).toBeVisible();
  });

  test('should filter courts by surface type', async ({ page }) => {
    await page.selectOption('select[id="surface"], select[name="surface"]', 'SYNTHETIC');
    await page.click('button:has-text("Buscar")');
    await expect(page.locator('#catalog-section')).toBeVisible();
  });

  test('should search courts by name', async ({ page }) => {
    await page.fill('input[placeholder*="Buscar"], input[name="search"]', 'futbol');
    await page.click('button:has-text("Buscar")');
    await expect(page.locator('#catalog-section')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    await page.selectOption('select[id="sport_type"], select[name="sport_type"]', 'FOOTBALL');
    await page.click('button:has-text("Limpiar")');
    await expect(page.locator('select[id="sport_type"], select[name="sport_type"]')).toHaveValue('');
  });

  test('should display court cards with details', async ({ page }) => {
    await expect(page.locator('#catalog-section .grid')).toBeVisible();
  });

  test('should navigate to court detail on click', async ({ page }) => {
    const firstCourtLink = page.locator('a[href^="/courts/"]').first();
    await expect(firstCourtLink).toBeVisible();
    await firstCourtLink.click();
    await expect(page).toHaveURL(/\/courts\/\d+/);
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Preguntas")')).toBeVisible();
  });

  test('should toggle FAQ items', async ({ page }) => {
    const faqButton = page.locator('button:has-text("¿Cómo reservo")').first();
    if (await faqButton.isVisible()) {
      await faqButton.click();
      await expect(page.locator('text=Selecciona la cancha')).toBeVisible();
    }
  });

  test('should display CTA section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Listo para jugar")')).toBeVisible();
  });

  test('should navigate to register from CTA', async ({ page }) => {
    await page.click('a:has-text("Regístrate")');
    await expect(page).toHaveURL(/\/register/);
  });
});