'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './SiteFooter';
import { MarketingHeader } from './MarketingHeader';

const AUTH_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const PLATFORM_PATHS = [
  '/dashboard',
  '/welcome',
  '/wallet',
  '/messages',
  '/calendar',
  '/offers',
  '/tenancies',
  '/listings',
  '/organizations',
  '/categories',
  '/settings',
  '/lettings-add-ons',
  '/sales-add-ons',
  '/property-valuation',
  '/tenant-referencing',
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isPlatformRoute = PLATFORM_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAuthRoute || isPlatformRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <MarketingHeader theme="light" />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
