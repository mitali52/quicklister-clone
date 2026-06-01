import { create } from 'zustand';
import type { AuthUser, AuthResponse } from '@/lib/schemas/auth.schemas';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  status: 'loading',

  setAuth: (response: AuthResponse) =>
    set({
      user: response.user,
      accessToken: response.accessToken,
      status: 'authenticated',
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
    }),
}));
