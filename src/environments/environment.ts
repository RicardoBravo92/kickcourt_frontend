const w = (window as any).__env || {};

export const environment = {
  production: false,
  apiUrl: w.apiUrl || 'http://127.0.0.1:8000',
};
