'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getAdminDashboard } from '@/lib/api/dashboard.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ErrorState, LoadingCards, PageHeader, Panel, StatusPill } from './AdminUi';

function Metric({
  label,
  value,
  hint,
  accent = 'from-blue-600 to-cyan-500',
}: {
  label: string;
  value: string | number;
  hint: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </div>
  );
}

export function AdminDashboardContent() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });

  const apiError = error instanceof ApiError ? error.message : null;
  const displayName = user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin console"
        title={`Welcome back, ${displayName}`}
        subtitle="Review the platform, manage users and listings, and monitor moderation from one place."
        actions={
          <>
            <Link href="/moderation" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              Review queue
            </Link>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Refresh
            </button>
          </>
        }
      />

      {isLoading && <div className="mt-6"><LoadingCards /></div>}

      {!isLoading && apiError && (
        <div className="mt-6">
          <ErrorState
            title="Unable to load the admin dashboard."
            message={apiError}
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try again
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !apiError && data && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Total users"
              value={data.users.totalUsers}
              hint={`${data.users.activeUsers} active accounts`}
            />
            <Metric
              label="Pending reviews"
              value={data.moderation.pendingReviews}
              hint="Listings waiting for moderation"
              accent="from-amber-500 to-orange-400"
            />
            <Metric
              label="Organizations"
              value={data.organizations.totalOrganizations}
              hint={`${data.organizations.activeOrganizations} active`}
              accent="from-emerald-500 to-green-400"
            />
            <Metric
              label="Audit events"
              value={data.system.auditLogsGenerated}
              hint={`${data.system.notificationsSent} notifications sent`}
              accent="from-fuchsia-500 to-violet-500"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <Panel title="Platform overview" subtitle="A quick read on the platform state.">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Listings</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.listings.totalListings}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {data.listings.pendingListings} pending, {data.listings.approvedListings} approved
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">User health</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.users.activeUsers}</p>
                  <p className="mt-1 text-sm text-slate-500">{data.users.blockedUsers} blocked accounts</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Recent signups</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.system.notificationsSent}</p>
                  <p className="mt-1 text-sm text-slate-500">Cross-platform notifications</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Publishing pipeline</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.moderation.pendingReviews}</p>
                  <p className="mt-1 text-sm text-slate-500">Waiting for approval</p>
                </div>
              </div>
            </Panel>

            <Panel title="Admin shortcuts" subtitle="Jump directly to the busiest workflows.">
              <div className="grid gap-3">
                <Link href="/moderation" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Open review queue
                </Link>
                <Link href="/admin/users" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage users
                </Link>
                <Link href="/admin/listings" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Monitor listings
                </Link>
                <Link href="/admin/audit-logs" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Inspect audit logs
                </Link>
              </div>
            </Panel>
          </div>

          <Panel title="Workflow checkpoint" subtitle="The admin journey across the platform.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Review', 'Listings enter the moderation queue before publication'],
                ['Approve', 'Admin or moderator approves ownership and listing data'],
                ['Publish', 'Approved content becomes visible to the market'],
                ['Monitor', 'Audit logs, users, and live listings remain under review'],
              ].map(([stage, description]) => (
                <div key={stage} className="rounded-2xl border border-slate-100 p-4">
                  <StatusPill value={stage} tone={stage === 'Review' ? 'amber' : stage === 'Approve' ? 'blue' : stage === 'Publish' ? 'green' : 'violet'} />
                  <p className="mt-3 text-sm font-semibold text-slate-900">{stage}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
