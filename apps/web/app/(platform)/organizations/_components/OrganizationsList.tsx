'use client';

import Link from 'next/link';
import { useMyOrganizations } from '../_hooks/useOrganizations';
import { OrganizationCard } from './OrganizationCard';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">No organizations yet</h3>
      <p className="mt-1 text-sm text-slate-500">Create your first organization to get started.</p>
      <Link
        href="/organizations/new"
        className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Create organization
      </Link>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function OrganizationsList() {
  const { data, isLoading, error } = useMyOrganizations();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the organizations you own.</p>
        </div>
        <Link
          href="/organizations/new"
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          New organization
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((k) => <CardSkeleton key={k} />)}
        </div>
      )}

      {error !== null && !isLoading && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-sm font-medium text-red-700">Failed to load organizations.</p>
          <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
        </div>
      )}

      {data !== undefined && data.data.length === 0 && <EmptyState />}

      {data !== undefined && data.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
