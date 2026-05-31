import { type AuthResponseDto } from '../dto/auth-response.dto';
import { type LoginDto } from '../dto/login.dto';
import { type RegisterDto } from '../dto/register.dto';
import { type AuthUser } from './auth-user.interface';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponseDto>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  logout(userId: string): Promise<void>;
  validateUser(email: string, password: string): Promise<AuthUser | null>;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
