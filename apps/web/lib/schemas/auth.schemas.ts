import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z.string().email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .regex(/^(\+44|0)\d{10}$/, 'Enter a valid UK phone number (e.g. 07700 900000)')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;

export interface AuthUser {
  id: string;
  email: string;
  roleName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}
