import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Pool, type PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import { type LoginDto } from './dto/login.dto';
import { type RegisterDto } from './dto/register.dto';
import { type AuthResponseDto } from './dto/auth-response.dto';
import { type AuthUser } from './interfaces/auth-user.interface';
import { type JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { DATABASE_POOL } from '../database/database.providers';
import { hashToken, verifyPassword } from '../common/helpers/crypto.helper';
import { decodeJwtKey } from '../common/helpers/jwt-key.helper';
import { transaction } from '../database/helpers/query.helper';

interface AuthSessionRow {
  id: string;
  user_id: string;
  jti: string;
  family_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_jti: string | null;
}

interface IssuedSession extends AuthResponseDto {
  refreshToken: string;
  refreshExpiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedSession> {
    try {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) throw new ConflictException(`Email ${dto.email} is already registered`);

      const userRole = await this.rolesService.findByName('user');
      if (!userRole) {
        throw new InternalServerErrorException('Default role not found — run db:seed first');
      }

      const user = await this.usersService.create({
        roleId: userRole.id,
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
      });

      return this.issueSession({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: userRole.name,
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Registration failed', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async login(dto: LoginDto): Promise<IssuedSession> {
    try {
      const authUser = await this.validateUser(dto.email, dto.password);
      if (!authUser) throw new UnauthorizedException('Invalid email or password');

      return this.issueSession(authUser);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) return null;

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) return null;

      const role = await this.rolesService.findById(user.roleId);
      if (!role) {
        throw new UnauthorizedException('User role is missing');
      }

      return {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: role.name,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('User validation failed', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async refresh(refreshToken: string): Promise<IssuedSession> {
    try {
      const publicKey = decodeJwtKey(process.env.JWT_PUBLIC_KEY);

      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        algorithms: ['RS256'],
        publicKey,
      });

      if (payload.tokenType !== 'refresh' || !payload.jti || !payload.familyId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      const role = await this.rolesService.findById(user.roleId);
      if (!role) {
        throw new UnauthorizedException('User role is missing');
      }

      return this.rotateSession({
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          roleId: user.roleId,
          roleName: role.name,
        },
        familyId: payload.familyId,
        currentJti: payload.jti,
      });
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken?: string | null): Promise<void> {
    if (!refreshToken) return;

    try {
      const publicKey = decodeJwtKey(process.env.JWT_PUBLIC_KEY);
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        algorithms: ['RS256'],
        publicKey,
      });

      if (payload.tokenType !== 'refresh' || !payload.jti) {
        return;
      }

      await this.pool.query(
        `UPDATE auth_sessions
         SET revoked_at = NOW(), updated_at = NOW()
         WHERE jti = $1 AND revoked_at IS NULL`,
        [payload.jti],
      );
    } catch {
      // Logout should be idempotent. If the cookie is missing/invalid/expired,
      // the client will still clear local state and the cookie will be removed.
    }
  }

  private async issueSession(user: AuthUser): Promise<IssuedSession> {
    const privateKey = decodeJwtKey(process.env.JWT_PRIVATE_KEY);

    const accessExpiresIn = Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900);
    const refreshExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800);
    const familyId = randomUUID();
    const refreshJti = randomUUID();

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      tokenType: 'refresh',
      jti: refreshJti,
      familyId,
    };

    const accessToken = this.signAccessToken(user);

    const refreshToken = this.jwtService.sign(refreshPayload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: refreshExpiresIn,
    });

    await this.pool.query(
      `INSERT INTO auth_sessions (user_id, jti, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 second'))`,
      [user.id, refreshJti, familyId, hashToken(refreshToken), refreshExpiresIn],
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        roleName: user.roleName,
      },
    };
  }

  private async rotateSession(params: {
    refreshToken: string;
    user: AuthUser;
    familyId: string;
    currentJti: string;
  }): Promise<IssuedSession> {
    const privateKey = decodeJwtKey(process.env.JWT_PRIVATE_KEY);
    const accessExpiresIn = Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900);
    const refreshExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800);
    const nextJti = randomUUID();

    const accessToken = this.signAccessToken(params.user);

    const nextRefreshToken = this.jwtService.sign(
      {
        sub: params.user.id,
        email: params.user.email,
        roleId: params.user.roleId,
        roleName: params.user.roleName,
        tokenType: 'refresh',
        jti: nextJti,
        familyId: params.familyId,
      } satisfies JwtPayload,
      {
        algorithm: 'RS256',
        privateKey,
        expiresIn: refreshExpiresIn,
      },
    );

    await transaction(this.pool, async (client: PoolClient) => {
      const existingResult = await client.query<AuthSessionRow>(
        `SELECT * FROM auth_sessions
         WHERE jti = $1
         FOR UPDATE`,
        [params.currentJti],
      );

      const existing = existingResult.rows[0];
      if (
        !existing ||
        existing.revoked_at !== null ||
        existing.user_id !== params.user.id ||
        existing.family_id !== params.familyId ||
        existing.token_hash !== hashToken(params.refreshToken)
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await client.query(
        `UPDATE auth_sessions
         SET revoked_at = NOW(), replaced_by_jti = $1, updated_at = NOW()
         WHERE jti = $2`,
        [nextJti, params.currentJti],
      );

      await client.query(
        `INSERT INTO auth_sessions (user_id, jti, family_id, token_hash, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 second'))`,
        [
          params.user.id,
          nextJti,
          params.familyId,
          hashToken(nextRefreshToken),
          refreshExpiresIn,
        ],
      );
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn,
      user: {
        id: params.user.id,
        email: params.user.email,
        roleName: params.user.roleName,
      },
    };
  }

  private signAccessToken(user: AuthUser): string {
    const privateKey = decodeJwtKey(process.env.JWT_PRIVATE_KEY);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      tokenType: 'access',
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900),
    });
  }
}
