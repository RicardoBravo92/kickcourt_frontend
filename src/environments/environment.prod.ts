const w = (window as any).__env || {};

const rawApiUrl = (w.apiUrl || '').trim().replace(/\/+$/, '');

const normalizeApi = (url: string): string => {
  if (!url) return '';
  return url.includes('/api') ? url : `${url}/api`;
};

const toWs = (apiUrl: string): string => {
  if (!apiUrl) return '';
  const base = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  return base.replace(/^http/, 'ws');
};

export const environment = {
  production: true,
  apiUrl: normalizeApi(rawApiUrl),
  wsUrl: toWs(normalizeApi(rawApiUrl)),
};