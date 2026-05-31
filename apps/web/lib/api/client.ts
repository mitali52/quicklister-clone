import { useAuthStore } from '@/lib/stores/auth.store';
import type { AuthResponse } from '@/lib/schemas/auth.schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const data = (await res.json()) as { accessToken: string };
    // Merge the new access token into the existing auth state
    const current = useAuthStore.getState();
    setAuth({
      accessToken: data.accessToken,
      refreshToken: current.refreshToken ?? '',
      expiresIn: 900,
      user: current.user ?? { id: '', email: '', roleName: '' },
    });
    return data.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(method, path, body, false);
    }
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message: string;
    try {
      const json = JSON.parse(text) as { message?: string };
      message = json.message ?? text;
    } catch {
      message = text;
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export { ApiError };

export const apiGet = <T>(path: string): Promise<T> => request<T>('GET', path);

export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('POST', path, body);

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

export const apiDelete = <T>(path: string): Promise<T> => request<T>('DELETE', path);
