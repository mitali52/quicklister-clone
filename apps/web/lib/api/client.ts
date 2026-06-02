import { useAuthStore } from '@/lib/stores/auth.store';

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

type AuthSessionResponse = {
  accessToken: string;
  expiresIn: number;
  user: { id: string; email: string; roleName: string };
};

let refreshInFlight: Promise<AuthSessionResponse | null> | null = null;

function applyAuthSession(session: AuthSessionResponse): void {
  useAuthStore.getState().setAuth(session);
}

async function performSessionRefresh(): Promise<AuthSessionResponse | null> {
  if (refreshInFlight !== null) return refreshInFlight;

  refreshInFlight = (async () => {
    const { clearAuth } = useAuthStore.getState();

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
        }
        return null;
      }

      const data = (await res.json()) as AuthSessionResponse;
      applyAuthSession(data);
      return data;
    } catch {
      clearAuth();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function bootstrapAuthSession(): Promise<void> {
  if (useAuthStore.getState().status !== 'loading') {
    return;
  }

  await performSessionRefresh();
  if (useAuthStore.getState().status === 'loading') {
    useAuthStore.getState().clearAuth();
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
    credentials: 'include',
  });

  const shouldAttemptRefresh =
    retry && !path.startsWith('/auth/logout') && !path.startsWith('/auth/refresh');

  if (res.status === 401 && shouldAttemptRefresh) {
    const newSession = await performSessionRefresh();
    if (newSession) {
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

// Multipart file upload — does NOT set Content-Type (browser sets it with the boundary)
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (res.ok) {
    const json: unknown = await res.json();
    return json as T;
  }

  const text = await res.text().catch(() => res.statusText);
  let message: string;
  try {
    const parsed = JSON.parse(text) as { message?: string };
    message = parsed.message ?? text;
  } catch {
    message = text;
  }
  throw new ApiError(res.status, message);
}
