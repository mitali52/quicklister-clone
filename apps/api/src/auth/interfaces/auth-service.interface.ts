import { type AuthResponseDto } from '../dto/auth-response.dto';
import { type LoginDto } from '../dto/login.dto';
import { type RegisterDto } from '../dto/register.dto';
import { type AuthUser } from './auth-user.interface';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponseDto & { refreshToken: string; refreshExpiresIn: number }>;
  login(dto: LoginDto): Promise<AuthResponseDto & { refreshToken: string; refreshExpiresIn: number }>;
  refresh(refreshToken: string): Promise<AuthResponseDto & { refreshToken: string; refreshExpiresIn: number }>;
  logout(refreshToken?: string | null): Promise<void>;
  validateUser(email: string, password: string): Promise<AuthUser | null>;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
