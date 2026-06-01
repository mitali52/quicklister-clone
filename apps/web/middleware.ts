import { NextRequest, NextResponse } from 'next/server';

const REFRESH_COOKIE_NAME = 'ql-refresh-token';

const PROTECTED_PATHS = [
  '/dashboard',
  '/settings',
  '/listings',
  '/organizations',
  '/categories',
  '/offers',
  '/tenancies',
  '/admin',
  '/moderation',
  '/audit-logs',
  '/notifications',
];

const AUTH_PATHS = ['/login', '/register'];

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  } catch {
    return null;
  }
}

function getRefreshTokenExp(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payloadJson = decodeBase64Url(parts[1] ?? '');
  if (!payloadJson) return null;

  try {
    const payload = JSON.parse(payloadJson) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function hasValidRefreshToken(token: string | undefined): boolean {
  if (!token) return false;

  const exp = getRefreshTokenExp(token);
  if (exp === null) return false;

  return exp * 1000 > Date.now();
}

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const isAuthenticated = hasValidRefreshToken(refreshToken);

  if (isPathMatch(pathname, AUTH_PATHS) && isAuthenticated) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  if (isPathMatch(pathname, PROTECTED_PATHS) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/settings',
    '/settings/:path*',
    '/listings',
    '/listings/:path*',
    '/organizations',
    '/organizations/:path*',
    '/categories',
    '/categories/:path*',
    '/offers',
    '/offers/:path*',
    '/tenancies',
    '/tenancies/:path*',
    '/admin',
    '/admin/:path*',
    '/moderation',
    '/moderation/:path*',
    '/audit-logs',
    '/audit-logs/:path*',
    '/notifications',
    '/notifications/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
