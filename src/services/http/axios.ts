import axios from 'axios';
import { getApiBaseUrl } from '@/config';
import { getAccessToken, triggerUnauthorized } from '@/features/auth/session';

export const http = axios.create({
  baseURL: getApiBaseUrl(),
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      triggerUnauthorized();
    }
    return Promise.reject(error);
  }
);

