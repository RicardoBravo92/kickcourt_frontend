const w = (window as any).__env || {};

const rawApiUrl = (w.apiUrl || 'http://127.0.0.1:8000/api').trim().replace(/\/+$/, '');

const normalizeApi = (url: string): string => {
  if (!url) return '';
  return url.includes('/api') ? url : `${url}/api`;
};

export const environment = {
  production: false,
  apiUrl: normalizeApi(rawApiUrl),
};