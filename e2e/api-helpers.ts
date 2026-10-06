import { request, APIRequestContext } from '@playwright/test';

export async function createApiContext(baseURL: string = 'http://localhost:8000'): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });
}

export async function loginUser(api: APIRequestContext, username: string, password: string): Promise<string> {
  const response = await api.post('/api/auth/login', {
    data: { username, password },
  });
  const data = await response.json();
  return data.access_token || data.token;
}

export async function createTestUser(api: APIRequestContext, userData: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<any> {
  const response = await api.post('/api/users', {
    data: userData,
  });
  return await response.json();
}

export async function createTestCourt(api: APIRequestContext, token: string, courtData: {
  name: string;
  sport_type: string;
  surface: string;
  price_per_hour: number;
  description?: string;
}): Promise<any> {
  const response = await api.post('/api/courts', {
    data: courtData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function createTestBooking(api: APIRequestContext, token: string, bookingData: {
  court: number;
  date: string;
  start_time: string;
  end_time: string;
}): Promise<any> {
  const response = await api.post('/api/bookings', {
    data: bookingData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function cleanupTestData(api: APIRequestContext, token: string): Promise<void> {
  await api.delete('/api/test/cleanup', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => {});
}