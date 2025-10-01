// src/utils/api.ts
import axios from 'axios';
import { authService } from '@/services/authService';
import { triggerSessionExpiredSnackbar } from '@/components/SessionExpiredSnackbar/SessionExpiredSnackbar';

let isRefreshing = false;
let hasShownSessionExpired = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(config => {
  const token = authService.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const newAccessToken = await authService.refreshToken();
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        }

        originalRequest.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (!hasShownSessionExpired) {
          hasShownSessionExpired = true;
          triggerSessionExpiredSnackbar();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (originalRequest._retry && error.response?.status === 401) {
      console.error('Usuário não autorizado mesmo após refresh token.');
    }

    return Promise.reject(error);
  }
);

export default api;
