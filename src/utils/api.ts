// src/utils/api.ts
import axios from 'axios';
import { authService } from '@/services/authService';

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
  error => {
    if (error.response?.status === 401) {

      return authService.refreshToken().then(newToken => {
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } else {
          throw new Error('No new token');
        }
      }).catch(() => {
        authService.logout();
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/v0/login';
        return Promise.reject(error);
      });
    }
    return Promise.reject(error);
  }
);

export default api;
