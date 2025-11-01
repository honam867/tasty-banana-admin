export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return fromEnv || '/api';
}

export function getAppName() {
  return (import.meta.env.VITE_APP_NAME as string) || 'Admin';
}

