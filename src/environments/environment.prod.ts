const w = (window as any).__env || {};

export const environment = {
  production: true,
  apiUrl: w.apiUrl || '',
};
