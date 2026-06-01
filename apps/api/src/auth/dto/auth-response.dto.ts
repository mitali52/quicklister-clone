import { type AuthUser } from '../interfaces/auth-user.interface';

export class AuthResponseDto {
  accessToken: string;
  expiresIn: number;
  user: Pick<AuthUser, 'id' | 'email' | 'roleName'>;
}
