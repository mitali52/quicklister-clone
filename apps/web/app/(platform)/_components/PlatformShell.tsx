'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { logoutApi } from '@/lib/api/auth.api';
import { getMyProfileApi } from '@/lib/api/users.api';

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
};

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="flex h-5 w-5 items-center justify-center">{children}</span>;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m14.7 6.3 3 3" />
      <path d="M9.9 11.1 19 2l3 3-9.1 9.1" />
      <path d="M5 21 13 13" />
      <path d="M2 22l4-1 1-4-5 5z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16V7z" />
      <path d="M16 11h4" />
      <path d="M14 11h.01" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14" />
    </svg>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
      {children}
    </span>
  );
}

const mainNav: NavItem[] = [
  { label: 'Properties', href: '/welcome', icon: <HomeIcon /> },
  { label: 'Messages', href: '/messages', icon: <MessageIcon /> },
  { label: 'Calendar', href: '/calendar', icon: <CalendarIcon />, badge: 'NEW' },
  { label: 'My Offers', href: '/offers', icon: <ToolIcon /> },
  { label: 'My Tenancies', href: '/tenancies', icon: <ToolIcon /> },
  { label: 'Lettings Add-ons', href: '/lettings-add-ons', icon: <ToolIcon /> },
  { label: 'Sales Add-ons', href: '/sales-add-ons', icon: <ToolIcon /> },
  { label: 'Property Valuation', href: '/property-valuation', icon: <ToolIcon /> },
  { label: 'Tenant Referencing', href: '/tenant-referencing', icon: <ToolIcon /> },
];

const accountNav = [
  { label: 'My Account', href: '/settings' },
  { label: 'Quicklister Wallet', href: '/wallet' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PlatformNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-100 hover:bg-white/10',
      ].join(' ')}
    >
      <span className="flex items-center gap-3">
        <span className={active ? 'text-cyan-500' : 'text-slate-300'}>
          <IconWrap>{item.icon}</IconWrap>
        </span>
        <span>{item.label}</span>
      </span>
      {item.badge !== undefined && <Badge>{item.badge}</Badge>}
    </Link>
  );
}

export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(true);
  const { data: profile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getMyProfileApi,
    staleTime: 60_000,
  });

  const displayName =
    profile?.fullName ?? user?.email?.split('@')[0] ?? user?.email ?? 'My Account';

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // clear local state regardless
    } finally {
      clearAuth();
      router.replace('/login');
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-800 text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <Link href="/welcome" className="inline-flex items-baseline gap-1 text-3xl font-black italic tracking-tight">
          <span>Quicklister</span>
          <span className="text-cyan-400">Pro</span>
        </Link>
      </div>

      <div className="border-b border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={() => setAccountOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-slate-900 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">£0 Credits</p>
          </div>
          <svg
            className={['h-5 w-5 text-cyan-400 transition-transform', accountOpen ? 'rotate-180' : 'rotate-0'].join(' ')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {accountOpen && (
          <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-slate-900 shadow-sm">
            <p className="px-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              My Account
            </p>
            <div className="mt-2 space-y-1">
              {accountNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'block rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                      active ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Menu</p>
        <nav className="mt-3 space-y-1">
          {mainNav.map((item) => (
            <PlatformNavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <p className="mt-6 px-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Tools</p>
        <div className="mt-3 rounded-2xl bg-white/5 px-3 py-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Quick access</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Manage your account, credits, and listing workflow from one place.
          </p>
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-300"
          >
            My Account
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-80">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-80 border-r border-slate-700/80 lg:block">
        {sidebar}
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/welcome" className="text-lg font-black italic tracking-tight text-slate-800">
              Quicklister<span className="text-cyan-500">Pro</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="h-full w-80 max-w-[88vw]"
              onClick={(event) => event.stopPropagation()}
            >
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
