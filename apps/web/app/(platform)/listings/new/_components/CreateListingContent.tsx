'use client';

import Link from 'next/link';
import { ListingForm } from '../../_components/ListingForm';
import { useCreateListing } from '../../_hooks/useListings';
import type { CreateListing } from '@/lib/schemas/listing.schemas';

export function CreateListingContent() {
  const createListing = useCreateListing();

  async function handleSubmit(data: CreateListing) {
    await createListing.mutateAsync(data);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/listings"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to listings
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create listing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your listing will be saved as a draft. Submit it for review when ready to publish.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <ListingForm
          mode="create"
          onSubmit={handleSubmit}
          isPending={createListing.isPending}
          error={createListing.error}
        />
      </section>
    </div>
  );
}
