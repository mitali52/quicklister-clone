import { apiPost } from './client';
import type { Login, Register, AuthResponse } from '@/lib/schemas/auth.schemas';

export const loginApi = (data: Login): Promise<AuthResponse> =>
  apiPost<AuthResponse>('/auth/login', data);

export const registerApi = (data: Register): Promise<AuthResponse> =>
  apiPost<AuthResponse>('/auth/register', data);

export const logoutApi = (): Promise<void> => apiPost<void>('/auth/logout');
