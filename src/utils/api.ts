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
      authService.logout();
      window.location.href = '/v0/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
