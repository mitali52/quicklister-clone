'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowCircleIcon, MenuIcon } from '@/app/_components/auth/AuthIcons';

const navLinks = [
  { label: 'Property Search', href: '/search' },
  { label: 'The Platform', href: '/the-platform' },
  { label: 'Lettings', href: '/lettings' },
  { label: 'Sales', href: '/sales' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

type HeaderTheme = 'hero' | 'light';

interface MarketingHeaderProps {
  theme?: HeaderTheme;
}

function CloseIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronCircle() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l4 4-4 4" />
    </svg>
  );
}

function MenuCardLink({
  href,
  children,
  accent = false,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'block rounded-xl px-6 py-4 text-center text-xl font-bold transition-colors',
        accent
          ? 'bg-cyan-50 text-cyan-500 hover:bg-cyan-100'
          : 'text-slate-800 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

export function MarketingHeader({ theme = 'light' }: MarketingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isHero = theme === 'hero';

  const logoClassName = isHero
    ? 'text-xl font-extrabold italic tracking-tight text-white sm:text-2xl'
    : 'text-xl font-extrabold italic tracking-tight text-slate-700 sm:text-2xl';

  const menuButtonClassName = isHero
    ? 'rounded-md p-2 text-white transition-colors hover:bg-white/10'
    : 'rounded-md p-2 text-slate-800 transition-colors hover:bg-slate-100';

  const desktopLinkClassName = isHero
    ? 'text-sm font-semibold text-white/95 transition-colors hover:text-white'
    : 'text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950';

  return (
    <header className={isHero ? 'relative z-20' : 'relative z-30 border-b border-slate-200 bg-white'}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className={logoClassName} aria-label="Quicklister home">
          Quicklister
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={desktopLinkClassName}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-500"
          >
            Free Sign Up <ChevronCircle />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
          >
            Sign in <ChevronCircle />
          </Link>
        </div>

        <button
          type="button"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="marketing-menu"
          onClick={() => setIsOpen((prev) => !prev)}
          className={menuButtonClassName + ' lg:hidden'}
        >
          {isOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
        </button>
      </div>

      {isOpen && (
        <div id="marketing-menu" className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white shadow-2xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <Link href="/" className="text-4xl font-black italic tracking-tight text-slate-700">
                Quicklister
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-blue-700 hover:text-blue-900"
              >
                X Close
              </button>
            </div>
            <div className="my-4 border-t border-slate-200" />
            <nav aria-label="Mobile navigation" className="mx-auto max-w-md">
              <ul className="space-y-4 py-2" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-center text-2xl font-semibold text-slate-800 transition-colors hover:text-cyan-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col items-center gap-5 pb-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
                >
                  Sign in <ChevronCircle />
                </Link>
                <div className="w-full max-w-[390px] rounded-[28px] border border-slate-700 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-800">Free Sign Up</p>
                      <p className="mt-4 text-lg font-semibold text-slate-800">
                        Sell Your Home, Your Way
                      </p>
                      <p className="text-base text-slate-500">No Agents Commission</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-700 text-slate-700">
                      <ArrowCircleIcon className="h-10 w-10" />
                    </div>
                  </div>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-500"
                  >
                    Free Sign Up <ChevronCircle />
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
