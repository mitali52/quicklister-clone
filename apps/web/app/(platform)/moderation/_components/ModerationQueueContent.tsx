'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import {
  approveModerationListingApi,
  getModerationQueueApi,
  rejectModerationListingApi,
} from '@/lib/api/moderation.api';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  Panel,
  StatusPill,
  TableSkeleton,
  formatCurrency,
  formatDate,
} from '../../admin/_components/AdminUi';

const QUEUE_QUERY_KEY = ['moderation', 'queue'] as const;

export function ModerationQueueContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const query = useMemo(
    () => ({
      page,
      limit: 10,
    }),
    [page],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [...QUEUE_QUERY_KEY, query],
    queryFn: () => getModerationQueueApi(query.page, query.limit),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) =>
      approveModerationListingApi(listingId, { notes: notes[listingId]?.trim() || undefined }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) => {
      const note = notes[listingId]?.trim();
      return rejectModerationListingApi(listingId, {
        notes: note && note.length > 0 ? note : 'Rejected by moderation review.',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
    },
  });

  const apiError = error instanceof ApiError ? error.message : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Moderation"
        title="Review queue"
        subtitle="Approve or reject pending listings before they are published."
      />

      <div className="mt-6 space-y-6">
        {isLoading && <TableSkeleton columns={4} rows={5} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Failed to load the review queue."
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
            title="No listings waiting for review"
            description="When sellers submit listings, they will appear here for moderation."
          />
        )}

        {!isLoading && !apiError && data && data.data.length > 0 && (
          <>
            <div className="grid gap-4">
              {data.data.map((item) => {
                const itemNotes = notes[item.id] ?? '';
                const busy = approveMutation.isPending || rejectMutation.isPending;

                return (
                  <Panel
                    key={item.id}
                    title={item.title}
                    subtitle={`${item.city}, ${item.postcode} · Submitted ${formatDate(item.submittedAt)}`}
                    actions={<StatusPill value={item.listingType.replaceAll('_', ' ')} tone="blue" />}
                  >
                    <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
                      <div className="overflow-hidden rounded-2xl bg-slate-100">
                        {item.primaryPhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.primaryPhotoUrl} alt={item.title} className="h-56 w-full object-cover" />
                        ) : (
                          <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                            No photo available
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Info label="Submitter" value={item.submitter.fullName} />
                          <Info label="Email" value={item.submitter.email} />
                          <Info label="Bedrooms" value={item.bedrooms ?? 'Not set'} />
                          <Info
                            label="Price"
                            value={formatCurrency(item.askingPrice ?? item.monthlyRent, item.listingType.includes('let'))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Review notes
                            <textarea
                              value={itemNotes}
                              onChange={(event) =>
                                setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                              }
                              placeholder="Add approval or rejection notes for the seller"
                              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/admin/listings/${item.id}`}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Inspect listing
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void approveMutation.mutateAsync({ listingId: item.id })}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void rejectMutation.mutateAsync({ listingId: item.id })}
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </Panel>
                );
              })}
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

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
