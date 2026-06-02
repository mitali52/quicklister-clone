import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchClient } from './_components/SearchClient';

export const metadata: Metadata = {
  title: 'Property Search',
  description:
    'Search residential and commercial properties for sale or rent across the UK with Quicklister.',
  alternates: {
    canonical: '/search',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-10 w-56 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-4">
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
