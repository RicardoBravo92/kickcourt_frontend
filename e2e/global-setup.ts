import { FullConfig } from '@playwright/test';
import { createApiContext, loginUser } from './api-helpers';

async function globalSetup(config: FullConfig) {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:8000';
  const api = await createApiContext(baseURL);

  try {
    const adminToken = await loginUser(api, 'admin', 'adminpass123');
    process.env.ADMIN_TOKEN = adminToken;
    console.log('✓ Admin token obtained');
  } catch (e) {
    console.log('⚠ Could not obtain admin token, tests may be skipped');
  }

  try {
    const vendorToken = await loginUser(api, 'vendor', 'vendorpass123');
    process.env.VENDOR_TOKEN = vendorToken;
    console.log('✓ Vendor token obtained');
  } catch (e) {
    console.log('⚠ Could not obtain vendor token, tests may be skipped');
  }

  try {
    const userToken = await loginUser(api, 'testuser', 'testpass123');
    process.env.USER_TOKEN = userToken;
    console.log('✓ User token obtained');
  } catch (e) {
    console.log('⚠ Could not obtain user token, tests may be skipped');
  }

  await api.dispose();
}

export default globalSetup;