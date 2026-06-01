import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { type AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';

const REFRESH_COOKIE_NAME = 'ql-refresh-token';

function readCookieValue(cookieHeader: string | undefined, cookieName: string): string | null {
  if (!cookieHeader) return null;

  const segments = cookieHeader.split(';');
  for (const segment of segments) {
    const [rawKey, ...rest] = segment.split('=');
    const key = rawKey?.trim();
    if (key === cookieName) {
      return rest.join('=').trim() || null;
    }
  }

  return null;
}

function setRefreshCookie(res: Response, refreshToken: string, maxAgeSeconds: number): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.register(dto);
    setRefreshCookie(res, session.refreshToken, session.refreshExpiresIn);
    return {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      user: session.user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.login(dto);
    setRefreshCookie(res, session.refreshToken, session.refreshExpiresIn);
    return {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      user: session.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const cookieToken = readCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME);
    const refreshToken = cookieToken ?? dto?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const session = await this.authService.refresh(refreshToken);
      setRefreshCookie(res, session.refreshToken, session.refreshExpiresIn);
      return {
        accessToken: session.accessToken,
        expiresIn: session.expiresIn,
        user: session.user,
      };
    } catch (err) {
      clearRefreshCookie(res);
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = readCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME) ?? dto?.refreshToken;
    await this.authService.logout(refreshToken);
    clearRefreshCookie(res);
  }
}
