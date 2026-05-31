'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  useListing,
  useUpdateListing,
  useSubmitForReview,
  usePublishListing,
  useArchiveListing,
  useDeleteListing,
} from '../../_hooks/useListings';
import { ListingForm } from '../../_components/ListingForm';
import { ListingStatusBadge } from '../../_components/ListingStatusBadge';
import { ListingMediaManager } from './ListingMediaManager';
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/schemas/listing.schemas';
import type { UpdateListing } from '@/lib/schemas/listing.schemas';

interface ListingDetailProps {
  id: string;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-64 rounded bg-slate-200" />
        <div className="h-6 w-24 rounded-full bg-slate-200" />
      </div>
      {[1, 2, 3, 4].map((k) => (
        <div key={k} className="h-10 rounded-lg bg-slate-200" />
      ))}
    </div>
  );
}

// ── Lifecycle action buttons ──────────────────────────────────────────────────

function LifecycleActions({ id, status, isOwner, requesterRole }: {
  id: string;
  status: string;
  isOwner: boolean;
  requesterRole: string;
}) {
  const isModerator = requesterRole === 'moderator' || requesterRole === 'admin';
  const submitForReview = useSubmitForReview(id);
  const publishListing = usePublishListing(id);
  const archiveListing = useArchiveListing(id);

  const submitError = submitForReview.error instanceof ApiError ? submitForReview.error.message : null;
  const publishError = publishListing.error instanceof ApiError ? publishListing.error.message : null;
  const archiveError = archiveListing.error instanceof ApiError ? archiveListing.error.message : null;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-800">Listing actions</h2>

      <div className="space-y-3">
        {/* Owner: submit for review */}
        {isOwner && status === 'draft' && (
          <div>
            <button
              type="button"
              disabled={submitForReview.isPending}
              onClick={() => void submitForReview.mutateAsync()}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                submitForReview.isPending
                  ? 'cursor-not-allowed bg-amber-400'
                  : 'bg-amber-600 hover:bg-amber-700',
              )}
            >
              {submitForReview.isPending ? 'Submitting…' : 'Submit for review'}
            </button>
            {submitError && (
              <p className="mt-2 text-xs text-red-600" role="alert">{submitError}</p>
            )}
            <p className="mt-1.5 text-xs text-slate-500">
              Once submitted, a moderator will review your listing before it goes live.
            </p>
          </div>
        )}

        {/* Moderator: publish */}
        {isModerator && status === 'pending_review' && (
          <div>
            <button
              type="button"
              disabled={publishListing.isPending}
              onClick={() => void publishListing.mutateAsync()}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                publishListing.isPending
                  ? 'cursor-not-allowed bg-green-400'
                  : 'bg-green-600 hover:bg-green-700',
              )}
            >
              {publishListing.isPending ? 'Publishing…' : 'Publish listing'}
            </button>
            {publishError && (
              <p className="mt-2 text-xs text-red-600" role="alert">{publishError}</p>
            )}
          </div>
        )}

        {/* Owner or admin: archive */}
        {(isOwner || isModerator) && status !== 'archived' && (
          <div>
            <button
              type="button"
              disabled={archiveListing.isPending}
              onClick={() => void archiveListing.mutateAsync()}
              className={cn(
                'w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors',
                archiveListing.isPending
                  ? 'cursor-not-allowed border-slate-200 text-slate-400'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              {archiveListing.isPending ? 'Archiving…' : 'Archive listing'}
            </button>
            {archiveError && (
              <p className="mt-2 text-xs text-red-600" role="alert">{archiveError}</p>
            )}
          </div>
        )}

        {status === 'archived' && (
          <p className="text-sm text-slate-500 italic">This listing is archived and can no longer be modified.</p>
        )}

        {status === 'published' && isOwner && (
          <p className="text-sm text-slate-500">
            Your listing is live. Archive it to remove it from public view.
          </p>
        )}
      </div>
    </section>
  );
}

// ── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone({ id, isOwner, isModerator }: { id: string; isOwner: boolean; isModerator: boolean }) {
  const [confirmed, setConfirmed] = useState(false);
  const deleteListing = useDeleteListing();

  const apiErrorMessage = deleteListing.error instanceof ApiError ? deleteListing.error.message : null;
  const serverError =
    deleteListing.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  if (!isOwner && !isModerator) return null;

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-slate-800">Danger zone</h2>
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h3 className="text-base font-semibold text-red-700">Delete listing</h3>
        <p className="mt-1.5 max-w-prose text-sm text-slate-600">
          Deleting a listing is permanent. It will be removed and cannot be restored.
        </p>

        <div className="mt-4 flex items-start gap-3">
          <input
            id={`confirm-delete-${id}`}
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor={`confirm-delete-${id}`} className="cursor-pointer text-sm text-slate-700">
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
          disabled={!confirmed || deleteListing.isPending}
          onClick={() => void deleteListing.mutateAsync(id)}
          className={cn(
            'mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
            !confirmed || deleteListing.isPending
              ? 'cursor-not-allowed bg-red-300'
              : 'bg-red-600 hover:bg-red-700',
          )}
        >
          {deleteListing.isPending ? 'Deleting…' : 'Delete listing'}
        </button>
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ListingDetail({ id }: ListingDetailProps) {
  const { data: listing, isLoading, error } = useListing(id);
  const updateListing = useUpdateListing(id);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id;
  const roleName = currentUser?.roleName ?? 'user';

  const isOwner = listing !== undefined && listing.userId === currentUserId;
  const isModerator = roleName === 'moderator' || roleName === 'admin';
  const canEdit = isOwner && listing?.status === 'draft';

  async function handleUpdate(data: UpdateListing) {
    await updateListing.mutateAsync(data);
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
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {listing ? listing.title : 'Listing'}
          </h1>
          {listing && <ListingStatusBadge status={listing.status} />}
        </div>
        {listing && (
          <p className="mt-1 text-sm text-slate-500">
            {listing.addressLine1}, {listing.city} · {listing.postcode}
          </p>
        )}
      </div>

      {isLoading && <DetailSkeleton />}

      {error !== null && !isLoading && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-sm font-medium text-red-700">Failed to load listing.</p>
          <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
        </div>
      )}

      {listing !== undefined && (
        <div className="space-y-8">
          {/* Edit form for draft — owner only */}
          {canEdit ? (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-800">Listing details</h2>
              <ListingForm
                mode="edit"
                listing={listing}
                onSubmit={handleUpdate}
                isPending={updateListing.isPending}
                error={updateListing.error}
              />
            </section>
          ) : (
            /* Read-only view for non-draft or non-owners */
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-800">Listing details</h2>
              <dl className="space-y-4 text-sm">
                {listing.description && (
                  <div>
                    <dt className="font-medium text-slate-500">Description</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-slate-900">{listing.description}</dd>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-500">Listing type</dt>
                    <dd className="mt-0.5 text-slate-900">{LISTING_TYPE_LABELS[listing.listingType] ?? listing.listingType}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Property type</dt>
                    <dd className="mt-0.5 text-slate-900">{PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}</dd>
                  </div>
                </div>
                {(listing.monthlyRent ?? listing.askingPrice) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {listing.monthlyRent && (
                      <div>
                        <dt className="font-medium text-slate-500">Monthly rent</dt>
                        <dd className="mt-0.5 text-slate-900">£{(listing.monthlyRent / 100).toLocaleString('en-GB')} pcm</dd>
                      </div>
                    )}
                    {listing.askingPrice && (
                      <div>
                        <dt className="font-medium text-slate-500">Asking price</dt>
                        <dd className="mt-0.5 text-slate-900">£{(listing.askingPrice / 100).toLocaleString('en-GB')}</dd>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.bedrooms !== null && (
                    <div>
                      <dt className="font-medium text-slate-500">Bedrooms</dt>
                      <dd className="mt-0.5 text-slate-900">{listing.bedrooms}</dd>
                    </div>
                  )}
                  {listing.bathrooms !== null && (
                    <div>
                      <dt className="font-medium text-slate-500">Bathrooms</dt>
                      <dd className="mt-0.5 text-slate-900">{listing.bathrooms}</dd>
                    </div>
                  )}
                </div>
              </dl>
            </section>
          )}

          {/* Photos */}
          <ListingMediaManager listingId={id} isOwner={isOwner} />

          {/* Lifecycle actions */}
          <LifecycleActions
            id={id}
            status={listing.status}
            isOwner={isOwner}
            requesterRole={roleName}
          />

          {/* Danger zone */}
          <DangerZone id={id} isOwner={isOwner} isModerator={isModerator} />
        </div>
      )}
    </div>
  );
}
