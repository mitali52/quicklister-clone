'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { useOrganization, useUpdateOrganization, useDeleteOrganization } from '../../_hooks/useOrganizations';
import { OrganizationForm } from '../../_components/OrganizationForm';
import type { UpdateOrganization } from '@/lib/schemas/organization.schemas';
import { useAuthStore } from '@/lib/stores/auth.store';

interface OrganizationDetailProps {
  id: string;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((k) => (
          <div key={k} className="h-10 rounded-lg bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function DangerZone({ orgId, isOwner }: { orgId: string; isOwner: boolean }) {
  const [confirmed, setConfirmed] = useState(false);
  const deleteOrganization = useDeleteOrganization();

  const apiErrorMessage =
    deleteOrganization.error instanceof ApiError ? deleteOrganization.error.message : null;
  const serverError =
    deleteOrganization.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  if (!isOwner) return null;

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-slate-800">Danger zone</h2>
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h3 className="text-base font-semibold text-red-700">Delete organization</h3>
        <p className="mt-1.5 max-w-prose text-sm text-slate-600">
          Deleting an organization is permanent. All associated data will be removed.
        </p>

        <div className="mt-4 flex items-start gap-3">
          <input
            id={`confirm-delete-${orgId}`}
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <label
            htmlFor={`confirm-delete-${orgId}`}
            className="cursor-pointer text-sm text-slate-700"
          >
            I understand that this action is permanent and cannot be reversed.
          </label>
        </div>

        {serverError !== null && (
          <p className="mt-3 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="button"
          disabled={!confirmed || deleteOrganization.isPending}
          onClick={() => void deleteOrganization.mutateAsync(orgId)}
          className={cn(
            'mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
            !confirmed || deleteOrganization.isPending
              ? 'cursor-not-allowed bg-red-300'
              : 'bg-red-600 hover:bg-red-700',
          )}
        >
          {deleteOrganization.isPending ? 'Deleting…' : 'Delete organization'}
        </button>
      </div>
    </section>
  );
}

export function OrganizationDetail({ id }: OrganizationDetailProps) {
  const { data: org, isLoading, error } = useOrganization(id);
  const updateOrganization = useUpdateOrganization(id);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwner = org !== undefined && org.ownerId === currentUserId;

  async function handleUpdate(data: UpdateOrganization) {
    await updateOrganization.mutateAsync(data);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/organizations"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to organizations
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {org ? org.name : 'Organization'}
        </h1>
        {org && <p className="mt-1 text-sm text-slate-500">/{org.slug}</p>}
      </div>

      {isLoading && <DetailSkeleton />}

      {error !== null && !isLoading && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-sm font-medium text-red-700">Failed to load organization.</p>
          <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
        </div>
      )}

      {org !== undefined && (
        <div className="space-y-8">
          {/* Edit form (owner only) */}
          {isOwner ? (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-800">Organization details</h2>
              <OrganizationForm
                mode="edit"
                organization={org}
                onSubmit={handleUpdate}
                isPending={updateOrganization.isPending}
                error={updateOrganization.error}
              />
            </section>
          ) : (
            /* Read-only view for non-owners */
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-800">Organization details</h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-slate-500">Name</dt>
                  <dd className="mt-0.5 text-slate-900">{org.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Slug</dt>
                  <dd className="mt-0.5 text-slate-900">/{org.slug}</dd>
                </div>
                {org.description && (
                  <div>
                    <dt className="font-medium text-slate-500">Description</dt>
                    <dd className="mt-0.5 text-slate-900">{org.description}</dd>
                  </div>
                )}
                {org.websiteUrl && (
                  <div>
                    <dt className="font-medium text-slate-500">Website</dt>
                    <dd className="mt-0.5">
                      <a
                        href={org.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {org.websiteUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <DangerZone orgId={id} isOwner={isOwner} />
        </div>
      )}
    </div>
  );
}
