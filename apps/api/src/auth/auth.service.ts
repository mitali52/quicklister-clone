import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type LoginDto } from './dto/login.dto';
import { type RegisterDto } from './dto/register.dto';
import { type AuthResponseDto } from './dto/auth-response.dto';
import { type AuthUser } from './interfaces/auth-user.interface';
import { type JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { verifyPassword } from '../common/helpers/crypto.helper';
import { decodeJwtKey } from '../common/helpers/jwt-key.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
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

      return this.issueTokens({
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

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const authUser = await this.validateUser(dto.email, dto.password);
      if (!authUser) throw new UnauthorizedException('Invalid email or password');

      return this.issueTokens(authUser);
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

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const publicKey = decodeJwtKey(process.env.JWT_PUBLIC_KEY);

      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        algorithms: ['RS256'],
        publicKey,
      });

      const user = await this.usersService.findById(payload.sub);
      const role = await this.rolesService.findById(user.roleId);

      const accessToken = this.signAccessToken({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: role.name,
      });

      return { accessToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(_userId: string): Promise<void> {
    // Stateless JWT — tokens expire via TTL.
    // When Redis is integrated, store the refresh token jti in a denylist
    // and check it in JwtStrategy.validate() before allowing access.
  }

  private issueTokens(user: AuthUser): AuthResponseDto {
    const privateKey = decodeJwtKey(process.env.JWT_PRIVATE_KEY);

    const accessExpiresIn = Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900);
    const refreshExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
    };

    const accessToken = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        algorithm: 'RS256',
        privateKey,
        expiresIn: refreshExpiresIn,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        roleName: user.roleName,
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
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900),
    });
  }
}
