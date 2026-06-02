'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getAdminListingsApi } from '@/lib/api/admin.api';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  StatusPill,
  TableSkeleton,
  formatCurrency,
  formatDate,
} from '../../_components/AdminUi';

const LISTINGS_QUERY_KEY = ['admin', 'listings'] as const;

export function AdminListingsContent() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [listingType, setListingType] = useState('');

  const query = useMemo(
    () => ({
      search,
      status: status === '' ? undefined : status,
      listingType: listingType === '' ? undefined : listingType,
      page,
      limit: 10,
    }),
    [listingType, page, search, status],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [...LISTINGS_QUERY_KEY, query],
    queryFn: () => getAdminListingsApi(query),
  });

  const apiError = error instanceof ApiError ? error.message : null;

  function applyFilters() {
    setSearch(searchInput.trim());
    setStatus(statusInput);
    setListingType(typeInput);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="Listing monitoring"
        subtitle="Track all listings across the platform and inspect their publication state."
      />

      <div className="mt-6 space-y-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_180px_220px_120px]">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title, city, or postcode"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <select
            value={statusInput}
            onChange={(event) => setStatusInput(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={typeInput}
            onChange={(event) => setTypeInput(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All types</option>
            <option value="residential_sale">Residential sale</option>
            <option value="residential_let">Residential let</option>
            <option value="commercial_sale">Commercial sale</option>
            <option value="commercial_let">Commercial let</option>
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply
          </button>
        </div>

        {isLoading && <TableSkeleton columns={7} rows={6} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Failed to load listings."
            message={apiError}
            action={
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Reload
              </button>
            }
          />
        )}

        {!isLoading && !apiError && data && data.data.length === 0 && (
          <EmptyState
            title="No listings found"
            description="Try broadening the search or clearing the filters."
          />
        )}

        {!isLoading && !apiError && data && data.data.length > 0 && (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Listing</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((listing) => (
                      <tr key={listing.id}>
                        <td className="px-5 py-4">
                          <Link href={`/admin/listings/${listing.id}`} className="font-semibold text-slate-900 hover:text-slate-700">
                            {listing.title}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(listing.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{listing.ownerName}</p>
                          <p className="mt-1 text-slate-500">{listing.ownerEmail}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{listing.listingType.replaceAll('_', ' ')}</p>
                          <p className="mt-1 text-slate-500">{listing.propertyType}</p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill
                            value={listing.status.replaceAll('_', ' ')}
                            tone={listing.status === 'published' ? 'green' : listing.status === 'pending_review' ? 'amber' : listing.status === 'draft' ? 'slate' : 'red'}
                          />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">{listing.city}</p>
                          <p className="mt-1 text-slate-500">{listing.postcode}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatCurrency(listing.askingPrice ?? listing.monthlyRent, listing.listingType.includes('let'))}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <PaginationBar
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(data.meta.totalPages, current + 1))}
            />
          </>
        )}
      </div>
    </div>
  );
}
