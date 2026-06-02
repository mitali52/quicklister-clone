'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useListingDirectory } from '../_hooks/useListings';
import { ListingCard } from './ListingCard';

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((k) => (
        <div key={k} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </div>
          <div className="mb-3 h-3 w-1/2 rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-5 w-24 rounded-md bg-slate-200" />
            <div className="h-5 w-16 rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListingsList() {
  const roleName = useAuthStore((state) => state.user?.roleName);
  const isStaff = roleName === 'moderator' || roleName === 'admin';
  const { data, isLoading, error } = useListingDirectory(roleName);

  if (isLoading) return <ListingsSkeleton />;

  if (error !== null) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
        <p className="text-sm font-medium text-red-700">Failed to load listings.</p>
        <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          {isStaff ? 'No listings found' : 'No listings yet'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {isStaff
            ? 'Try adjusting the page filters or check back after more listings are submitted.'
            : 'Create your first listing to get started.'}
        </p>
        {!isStaff && (
          <Link
            href="/listings/new"
            className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            Create listing
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
