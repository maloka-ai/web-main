// src/services/authService.ts
import api from '@/utils/api'

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/login', payload);

    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);

    return response.data;
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('Refresh token não encontrado.');

    const response = await api.get<string>('/auth/refresh_token', {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const newAccessToken = response.data;
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

    return newAccessToken;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
