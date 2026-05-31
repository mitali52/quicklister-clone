import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingsList } from './_components/ListingsList';

export const metadata: Metadata = {
  title: 'My Listings | Quicklister',
};

export default function ListingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your property listings and track their status.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New listing
        </Link>
      </div>

      <ListingsList />
    </div>
  );
}
