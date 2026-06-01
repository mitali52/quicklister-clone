import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type JwtPayload } from '../interfaces/jwt-payload.interface';
import { type AuthUser } from '../interfaces/auth-user.interface';
import { decodeJwtKey } from '../../common/helpers/jwt-key.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
    };
  }
}
