'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import {
  getAdminListingApi,
  updateAdminListingStatusApi,
} from '@/lib/api/admin.api';
import { ErrorState, LoadingCards, PageHeader, Panel, StatusPill, formatCurrency, formatDate } from '../../../_components/AdminUi';

interface AdminListingDetailContentProps {
  id: string;
}

const STATUS_OPTIONS = ['draft', 'pending_review', 'published', 'archived'] as const;

export function AdminListingDetailContent({ id }: Readonly<AdminListingDetailContentProps>) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'published' | 'archived' | null>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'listings', id],
    queryFn: () => getAdminListingApi(id),
    enabled: Boolean(id),
  });

  const selectedStatus = status ?? data?.status ?? 'draft';

  const updateStatusMutation = useMutation({
    mutationFn: () => updateAdminListingStatusApi(id, { status: selectedStatus }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'listings', id] });
    },
  });

  const apiError = error instanceof ApiError ? error.message : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/admin/listings" className="text-sm text-slate-500 hover:text-slate-700">
          Back to listings
        </Link>
      </div>

      <PageHeader
        eyebrow="Admin"
        title={data?.title ?? 'Listing details'}
        subtitle={data?.addressLine1 ?? 'Inspect the listing lifecycle and publication state.'}
        actions={
          data && (
            <StatusPill
              value={data.status.replaceAll('_', ' ')}
              tone={data.status === 'published' ? 'green' : data.status === 'pending_review' ? 'amber' : data.status === 'draft' ? 'slate' : 'red'}
            />
          )
        }
      />

      <div className="mt-6 space-y-6">
        {isLoading && <LoadingCards count={2} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Unable to load listing details."
            message={apiError}
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            }
          />
        )}

        {data && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <Panel title="Listing summary" subtitle="Ownership and publication context.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Owner" value={data.ownerName} />
                <Info label="Owner email" value={data.ownerEmail} />
                <Info label="Type" value={data.listingType.replaceAll('_', ' ')} />
                <Info label="Property type" value={data.propertyType} />
                <Info label="City" value={data.city} />
                <Info label="Postcode" value={data.postcode} />
                <Info label="Created" value={formatDate(data.createdAt)} />
                <Info label="Updated" value={formatDate(data.updatedAt)} />
                <Info label="Media assets" value={data.mediaCount} />
                <Info label="Deleted" value={data.deletedAt ? formatDate(data.deletedAt) : 'No'} />
              </div>
            </Panel>

            <Panel title="Status control" subtitle="Adjust the publication state for monitoring purposes.">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Update status
                  <select
                    value={selectedStatus}
                    onChange={(event) => setStatus(event.target.value as NonNullable<typeof status>)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={updateStatusMutation.isPending || selectedStatus === data.status}
                  onClick={() => void updateStatusMutation.mutateAsync()}
                  className={[
                    'w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors',
                    updateStatusMutation.isPending || selectedStatus === data.status
                      ? 'cursor-not-allowed bg-slate-400'
                      : 'bg-slate-900 hover:bg-slate-800',
                  ].join(' ')}
                >
                  {updateStatusMutation.isPending ? 'Saving…' : 'Save status'}
                </button>
                <p className="text-sm text-slate-500">
                  Use this panel to move a listing between draft, review, published, and archived states.
                </p>
              </div>
            </Panel>
          </div>
        )}

        {data && (
          <Panel title="Description" subtitle="Full listing narrative and property context.">
            <div className="space-y-4">
              <Info label="Asking price" value={formatCurrency(data.askingPrice, false)} />
              <Info label="Monthly rent" value={formatCurrency(data.monthlyRent, true)} />
              <Info label="Bedrooms" value={data.bedrooms ?? 'Not set'} />
              <Info label="Bathrooms" value={data.bathrooms ?? 'Not set'} />
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {data.description ?? 'No description provided.'}
              </p>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
