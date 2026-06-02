'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ListingsList } from './ListingsList';

export function ListingsPageContent() {
  const roleName = useAuthStore((state) => state.user?.roleName);
  const isStaff = roleName === 'moderator' || roleName === 'admin';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isStaff ? 'All listings' : 'My listings'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isStaff
              ? 'Review submitted properties and inspect listing details across the platform.'
              : 'Manage your property listings and track their status.'}
          </p>
        </div>
        {!isStaff && (
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New listing
          </Link>
        )}
      </div>

      <ListingsList />
    </div>
  );
}
