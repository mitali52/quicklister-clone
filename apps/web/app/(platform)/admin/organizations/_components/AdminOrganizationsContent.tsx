'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getAdminOrganizationsApi } from '@/lib/api/admin.api';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  TableSkeleton,
  formatDate,
} from '../../_components/AdminUi';

const ORGS_QUERY_KEY = ['admin', 'organizations'] as const;

export function AdminOrganizationsContent() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [ownerIdInput, setOwnerIdInput] = useState('');
  const [search, setSearch] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const query = useMemo(
    () => ({
      search,
      ownerId,
      page,
      limit: 10,
    }),
    [ownerId, page, search],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [...ORGS_QUERY_KEY, query],
    queryFn: () => getAdminOrganizationsApi(query),
  });

  const apiError = error instanceof ApiError ? error.message : null;

  function applyFilters() {
    setSearch(searchInput.trim());
    setOwnerId(ownerIdInput.trim());
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="Organization management"
        subtitle="Review organizations, inspect ownership, and track the listings attached to each company."
      />

      <div className="mt-6 space-y-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px]">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by organization name or slug"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={ownerIdInput}
            onChange={(event) => setOwnerIdInput(event.target.value)}
            placeholder="Filter by owner ID"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply
          </button>
        </div>

        {isLoading && <TableSkeleton columns={5} rows={6} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Failed to load organizations."
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
            title="No organizations found"
            description="Try a broader search or clear the owner filter."
          />
        )}

        {!isLoading && !apiError && data && data.data.length > 0 && (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Listings</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((org) => (
                      <tr key={org.id}>
                        <td className="px-5 py-4">
                          <Link href={`/admin/organizations/${org.id}`} className="font-semibold text-slate-900 hover:text-slate-700">
                            {org.name}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-slate-500">/{org.slug}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{org.ownerName}</p>
                          <p className="mt-1 text-slate-500">{org.ownerEmail}</p>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{org.listingCount}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{formatDate(org.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/organizations/${org.id}`}
                            className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
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
