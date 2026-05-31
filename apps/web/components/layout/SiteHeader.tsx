import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import type { NavLink } from './MobileMenu';

const navLinks: NavLink[] = [
  { label: 'Property Search', href: '/search' },
  { label: 'The Platform', href: '/the-platform' },
  { label: 'Lettings', href: '/lettings' },
  { label: 'Sales', href: '/sales' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-extrabold tracking-tight text-blue-700"
          aria-label="Quicklister — home"
        >
          Quicklister
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex lg:items-center lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Free Sign Up
          </Link>
        </div>

        <MobileMenu navLinks={navLinks} />
      </div>
    </header>
  );
}
