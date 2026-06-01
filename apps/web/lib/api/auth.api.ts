import { apiPost } from './client';
import type {
  Login,
  Register,
  AuthResponse,
  ForgotPassword,
  PasswordResetRequestResponse,
  ResetPassword,
} from '@/lib/schemas/auth.schemas';

export const loginApi = (data: Login): Promise<AuthResponse> =>
  apiPost<AuthResponse>('/auth/login', data);

export const registerApi = (data: Register): Promise<AuthResponse> =>
  apiPost<AuthResponse>('/auth/register', data);

export const logoutApi = (): Promise<void> => apiPost<void>('/auth/logout');

export const requestPasswordResetApi = (
  data: ForgotPassword,
): Promise<PasswordResetRequestResponse> => apiPost<PasswordResetRequestResponse>('/auth/forgot-password', data);

export const resetPasswordApi = (data: ResetPassword): Promise<void> =>
  apiPost<void>('/auth/reset-password', data);
