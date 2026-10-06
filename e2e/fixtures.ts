import { test as base, Page } from '@playwright/test';

interface TestFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  vendorPage: Page;
}

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.TEST_USER || 'testuser');
    await page.fill('input[id="password"]', process.env.TEST_PASS || 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/courts/);
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.ADMIN_USER || 'admin');
    await page.fill('input[id="password"]', process.env.ADMIN_PASS || 'adminpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/courts/);
    await use(page);
  },

  vendorPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.VENDOR_USER || 'vendor');
    await page.fill('input[id="password"]', process.env.VENDOR_PASS || 'vendorpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/courts/);
    await use(page);
  },
});

export { expect } from '@playwright/test';