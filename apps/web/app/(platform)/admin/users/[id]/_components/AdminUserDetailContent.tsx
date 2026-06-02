'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import {
  activateAdminUserApi,
  getAdminUserApi,
  suspendAdminUserApi,
} from '@/lib/api/admin.api';
import { ErrorState, LoadingCards, PageHeader, Panel, StatusPill, formatDate } from '../../../_components/AdminUi';

interface AdminUserDetailContentProps {
  id: string;
}

export function AdminUserDetailContent({ id }: Readonly<AdminUserDetailContentProps>) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => getAdminUserApi(id),
    enabled: Boolean(id),
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!data) return;
      return data.suspended ? activateAdminUserApi(id) : suspendAdminUserApi(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });

  const apiError = error instanceof ApiError ? error.message : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-700">
          Back to users
        </Link>
      </div>

      <PageHeader
        eyebrow="Admin"
        title={data?.fullName ?? 'User details'}
        subtitle={data?.email ?? 'Inspect account activity and profile details.'}
        actions={
          data && (
            <button
              type="button"
              disabled={toggleMutation.isPending || data.roleName === 'admin'}
              onClick={() => void toggleMutation.mutateAsync()}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold text-white',
                data.roleName === 'admin'
                  ? 'cursor-not-allowed bg-slate-400'
                  : data.suspended
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700',
              ].join(' ')}
            >
              {data.roleName === 'admin' ? 'Admin account' : data.suspended ? 'Activate account' : 'Suspend account'}
            </button>
          )
        }
      />

      <div className="mt-6 space-y-6">
        {isLoading && <LoadingCards count={2} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Unable to load user details."
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
          <>
            <Panel title="Profile summary" subtitle="Core identity and status information.">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Info label="Role" value={<StatusPill value={data.roleName} tone={data.roleName === 'admin' ? 'violet' : data.roleName === 'moderator' ? 'blue' : 'slate'} />} />
                <Info label="Status" value={<StatusPill value={data.suspended ? 'Suspended' : 'Active'} tone={data.suspended ? 'red' : 'green'} />} />
                <Info label="Email verified" value={<StatusPill value={data.emailVerified ? 'Yes' : 'No'} tone={data.emailVerified ? 'green' : 'amber'} />} />
                <Info label="Full name" value={data.fullName} />
                <Info label="Phone" value={data.phoneNumber ?? 'Not set'} />
                <Info label="Member since" value={formatDate(data.createdAt)} />
                <Info label="Listings" value={data.listingCount} />
                <Info label="Organizations" value={data.organizationCount} />
                <Info label="Last updated" value={formatDate(data.updatedAt)} />
              </div>
            </Panel>

            <Panel title="Contact details" subtitle="Address and communication details on file.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Address line 1" value={data.addressLine1 ?? 'Not set'} />
                <Info label="Address line 2" value={data.addressLine2 ?? 'Not set'} />
                <Info label="City" value={data.city ?? 'Not set'} />
                <Info label="County" value={data.county ?? 'Not set'} />
                <Info label="Postcode" value={data.postcode ?? 'Not set'} />
                <Info label="NRLA member" value={<StatusPill value={data.nrlaMember ? 'Yes' : 'No'} tone={data.nrlaMember ? 'green' : 'slate'} />} />
              </div>
            </Panel>
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
