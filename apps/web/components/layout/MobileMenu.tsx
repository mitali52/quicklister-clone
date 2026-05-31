'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        {isOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto max-w-7xl px-4 py-4 sm:px-6"
          >
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 border-t border-slate-200 pt-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="mt-1 block rounded-md bg-blue-700 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Free Sign Up
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
