// src/services/authService.ts
import api from '@/utils/api'
import { is } from 'date-fns/locale';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshAuthTokens {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginAuthTokens> {
    const response = await api.post<LoginAuthTokens>('/auth/login', payload);

    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
    localStorage.setItem(USER_EMAIL_KEY, payload.email);

    return response.data;
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('Refresh token não encontrado.');

    const response = await api.get<RefreshAuthTokens>('/auth/refresh_token', {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.data.access_token) {
      throw new Error('Falha ao atualizar o token de acesso.');
    }

    const newAccessToken = response.data.access_token;
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

    return newAccessToken;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  },

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
