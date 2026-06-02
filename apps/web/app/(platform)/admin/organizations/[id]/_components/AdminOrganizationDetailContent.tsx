'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getAdminOrganizationApi } from '@/lib/api/admin.api';
import { ErrorState, LoadingCards, PageHeader, Panel, formatDate } from '../../../_components/AdminUi';

interface AdminOrganizationDetailContentProps {
  id: string;
}

export function AdminOrganizationDetailContent({ id }: Readonly<AdminOrganizationDetailContentProps>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'organizations', id],
    queryFn: () => getAdminOrganizationApi(id),
    enabled: Boolean(id),
  });

  const apiError = error instanceof ApiError ? error.message : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/admin/organizations" className="text-sm text-slate-500 hover:text-slate-700">
          Back to organizations
        </Link>
      </div>

      <PageHeader
        eyebrow="Admin"
        title={data?.name ?? 'Organization details'}
        subtitle={data?.description ?? 'Review organization ownership and associated listing volume.'}
      />

      <div className="mt-6 space-y-6">
        {isLoading && <LoadingCards count={2} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Unable to load organization details."
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
            <Panel title="Organization summary" subtitle="Ownership and publication context.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Owner" value={data.ownerName} />
                <Info label="Owner email" value={data.ownerEmail} />
                <Info label="Slug" value={`/${data.slug}`} />
                <Info label="Listings" value={data.listingCount} />
                <Info label="Created" value={formatDate(data.createdAt)} />
                <Info label="Updated" value={formatDate(data.updatedAt)} />
              </div>
            </Panel>

            <Panel title="External footprint" subtitle="How the organization appears publicly.">
              <div className="space-y-4 text-sm">
                <Info label="Website" value={data.websiteUrl ?? 'Not set'} />
                <Info label="Logo" value={data.logoUrl ?? 'Not set'} />
                <Info label="Description" value={data.description ?? 'Not set'} />
              </div>
            </Panel>
          </div>
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
