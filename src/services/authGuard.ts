// services/authGuard.ts
import { authService } from "@/services/authService";

let refreshPromise: Promise<string> | null = null;

export async function ensureValidAccessToken() {
  const token = authService.getAccessToken();

  if (!token || authService.isTokenExpired(token)) {
    if (!refreshPromise) {
      refreshPromise = authService.refreshToken()
        .finally(() => {
          refreshPromise = null;
        });
    }
    await refreshPromise;
  }

  return authService.getAccessToken();
}
