import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { type JwtPayload } from '../interfaces/jwt-payload.interface';
import { type AuthUser } from '../interfaces/auth-user.interface';
import { decodeJwtKey } from '../../common/helpers/jwt-key.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // passport-jwt does not ship useful typings in this workspace.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: (request: Request | null): string | null => {
        const authorization = request?.headers.authorization;
        if (!authorization?.startsWith('Bearer ')) return null;
        return authorization.slice('Bearer '.length);
      },
      ignoreExpiration: false,
      // RS256 — public key verifies; private key signs (in AuthService)
      secretOrKey: decodeJwtKey(process.env.JWT_PUBLIC_KEY),
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions ?? [],
    };
  }
}
