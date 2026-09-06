import axios from 'axios';

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(callback: UnauthorizedHandler) {
  onUnauthorizedCallback = callback;
}

export function unregisterUnauthorizedHandler() {
  onUnauthorizedCallback = null;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error handling and 401 session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const originalRequestUrl = error.config?.url || '';

      // If session expired and not currently attempting login or initial auth check
      if (status === 401 && !originalRequestUrl.includes('/admin/auth/login')) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
    }
    return Promise.reject(error);
  }
);
