const w = (window as any).__env || {};

const rawApiUrl = (w.apiUrl || '').trim().replace(/\/+$/, '');

const normalizeApi = (url: string): string => {
  if (!url) return '';
  return url.includes('/api') ? url : `${url}/api`;
};

export const environment = {
  production: true,
  apiUrl: normalizeApi(rawApiUrl),
};