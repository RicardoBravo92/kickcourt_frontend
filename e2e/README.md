# E2E Tests for Soccer Frontend

This directory contains Playwright end-to-end tests for the Soccer Frontend application.

## Test Structure

```
e2e/
├── landing.spec.ts        # Landing page and court listing tests
├── auth.spec.ts           # Authentication flow tests
├── booking.spec.ts        # Court detail and booking flow tests
├── admin-vendor.spec.ts   # Admin and vendor dashboard tests
├── profile-nav.spec.ts    # Profile and navigation tests
├── authenticated-flows.spec.ts # Tests using authenticated fixtures
├── fixtures.ts            # Playwright test fixtures for auth
├── api-helpers.ts         # API helpers for test setup
├── global-setup.ts        # Global test setup
├── .env.example           # Environment variables template
└── playwright.config.ts   # Playwright configuration
```

## Running Tests

### Prerequisites

1. Start the backend API server (typically on port 8000)
2. Start the frontend development server (typically on port 4200)

```bash
# Terminal 1: Start backend
cd ../soccer_backend
# Start your backend server

# Terminal 2: Start frontend
cd ../soccer_frontend
npm run start
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (see browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test e2e/landing.spec.ts
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Categories

### 1. Public Pages (No Auth Required)
- `landing.spec.ts` - Hero, court catalog, filters, FAQ, CTA
- `auth.spec.ts` - Login, register, forgot password, protected route redirects

### 2. Authenticated User Flows
- `booking.spec.ts` - Court detail, booking creation, my bookings
- `profile-nav.spec.ts` - Profile, navigation, i18n

### 3. Admin Flows (Requires Admin Role)
- `admin-vendor.spec.ts` - Dashboard, court management, booking management, user management

### 4. Vendor Flows (Requires Vendor Role)
- `admin-vendor.spec.ts` - Dashboard, courts, schedules, blocks, bookings

## Authentication

Tests that require authentication use the fixtures in `fixtures.ts`. These fixtures automatically log in before each test.

### Setting Up Test Users

You need test users in your backend:
- Regular user: `testuser` / `testpass123`
- Admin user: `admin` / `adminpass123`
- Vendor user: `vendor` / `vendorpass123`

Or set environment variables:
```bash
export TEST_USER=youruser
export TEST_PASS=yourpass
export ADMIN_USER=youradmin
export ADMIN_PASS=youradminpass
export VENDOR_USER=yourvendor
export VENDOR_PASS=yourvendorpass
```

## CI/CD Configuration

For CI environments, the tests run with:
- `reuseExistingServer: false` - Starts fresh server
- `retries: 2` - Retries failed tests
- `workers: 1` - Sequential execution

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
  });

  test('should do something', async ({ page }) => {
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Using Authenticated Fixtures

```typescript
import { test, expect } from './fixtures';

test('should do something as logged in user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/protected-route');
  await expect(authenticatedPage.locator('selector')).toBeVisible();
});
```

### Using Admin/Vendor Fixtures

```typescript
import { test, expect } from './fixtures';

test('should do admin thing', async ({ adminPage }) => {
  await adminPage.goto('/admin');
  await expect(adminPage.locator('selector')).toBeVisible();
});
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for network idle** after actions that trigger API calls
3. **Use explicit waits** instead of hardcoded timeouts
4. **Keep tests independent** - each test should set up its own state
5. **Clean up test data** in afterEach or global teardown
6. **Run tests in parallel** when possible (default)

## Debugging

1. Use `--debug` flag to step through tests
2. Use `--headed` to see browser
3. Check `test-results/` for traces, screenshots, videos
4. Use `page.pause()` in test code to pause execution

## Reports

After test run, view HTML report:
```bash
npx playwright show-report
```