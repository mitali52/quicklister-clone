'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  getAdminDashboard,
  getModeratorDashboard,
  getUserDashboard,
  type AdminDashboardResponse,
  type ModeratorDashboardResponse,
  type UserDashboardResponse,
} from '@/lib/api/dashboard.api';
import { useAuthStore } from '@/lib/stores/auth.store';

type DashboardData =
  | { kind: 'user'; data: UserDashboardResponse }
  | { kind: 'moderator'; data: ModeratorDashboardResponse }
  | { kind: 'admin'; data: AdminDashboardResponse };

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function formatCurrency(amount: number | null, monthly = false) {
  if (amount === null) return 'N/A';
  const suffix = monthly ? '/mo' : '';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount) + suffix;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function MetricCard({
  label,
  value,
  hint,
  accent = 'from-blue-600 to-cyan-500',
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
      {hint !== undefined && <div className="mt-2 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle !== undefined && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions !== undefined && <div>{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value === 'approved'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : value === 'rejected'
        ? 'bg-red-50 text-red-700 ring-red-100'
        : 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone}`}>
      {capitalize(value)}
    </span>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const roleName = user?.roleName ?? 'user';
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        if (roleName === 'admin') {
          const payload = await getAdminDashboard();
          if (active) {
            setData({ kind: 'admin', data: payload });
          }
          return;
        }

        if (roleName === 'moderator') {
          const payload = await getModeratorDashboard();
          if (active) {
            setData({ kind: 'moderator', data: payload });
          }
          return;
        }

        const payload = await getUserDashboard();
        if (active) {
          setData({ kind: 'user', data: payload });
        }
      } catch (err) {
        if (!active) return;
        const message = err instanceof ApiError ? err.message : 'Failed to load dashboard.';
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [refreshKey, roleName]);

  const displayName = user?.email?.split('@')[0] ?? 'there';
  const roleLabel = capitalize(roleName);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white shadow-lg sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="text-sm font-medium text-slate-300">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back, {displayName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            You are signed in as {user?.email ?? 'an authenticated user'} and viewing the {roleLabel.toLowerCase()} dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15">
            {roleLabel}
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <LoadingGrid />}

      {!loading && error !== null && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-sm font-semibold text-red-700">Unable to load your dashboard.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && error === null && data?.kind === 'user' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total listings" value={data.data.stats.totalListings} hint="All properties you have created" />
              <MetricCard label="Pending" value={data.data.stats.pendingListings} hint="Waiting for review" accent="from-amber-500 to-orange-400" />
              <MetricCard label="Approved" value={data.data.stats.approvedListings} hint="Live or approved listings" accent="from-emerald-500 to-green-400" />
              <MetricCard label="Unread notifications" value={data.data.unreadNotifications} hint="Messages and alerts" accent="from-fuchsia-500 to-violet-500" />
            </div>

            <SectionCard title="Recent listings" subtitle="Your latest property entries and their current status.">
              {data.data.recentListings.length === 0 ? (
                <p className="text-sm text-slate-500">No listings yet. Start by creating your first property listing.</p>
              ) : (
                <div className="space-y-3">
                  {data.data.recentListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                          <StatusPill value={listing.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {listing.propertyType} · {listing.listingType} · {listing.city}, {listing.postcode}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {formatCurrency(listing.askingPrice, listing.listingType === 'rent')}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Your profile" subtitle="Account details on file.">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium text-slate-900">{data.data.profile.fullName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-900">{data.data.profile.email}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-900">{data.data.profile.phoneNumber ?? 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Member since</span>
                  <span className="font-medium text-slate-900">{formatDate(data.data.profile.createdAt)}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Quick actions" subtitle="Jump back into the app.">
              <div className="grid gap-3">
                <Link href="/listings/new" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Create a listing
                </Link>
                <Link href="/listings" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  View listings
                </Link>
                <Link href="/settings" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Account settings
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {!loading && error === null && data?.kind === 'moderator' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Pending reviews" value={data.data.reviewStats.pendingReviews} hint="Waiting in the review queue" accent="from-amber-500 to-orange-400" />
              <MetricCard label="Approved today" value={data.data.reviewStats.approvedToday} hint="Listings approved today" accent="from-emerald-500 to-green-400" />
              <MetricCard label="Rejected today" value={data.data.reviewStats.rejectedToday} hint="Listings rejected today" accent="from-rose-500 to-red-500" />
              <MetricCard label="Listings waiting" value={data.data.queueStats.listingsWaiting} hint="Awaiting moderation" accent="from-fuchsia-500 to-violet-500" />
            </div>

            <SectionCard title="Recent moderation activity" subtitle="Latest review decisions across the platform.">
              {data.data.recentReviews.items.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.data.recentReviews.items.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{review.listingTitle}</h3>
                            <StatusPill value={review.decision} />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {review.listingCity}, {review.listingPostcode}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">{review.notes ?? 'No moderation notes added.'}</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          Reviewed {formatDate(review.reviewedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Review queue" subtitle="Current queue status for your moderation work.">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Queue depth</span>
                  <span className="font-semibold text-slate-900">{data.data.queueStats.listingsWaiting}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Pending reviews</span>
                  <span className="font-semibold text-slate-900">{data.data.reviewStats.pendingReviews}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Quick actions" subtitle="Shortcuts for moderation tasks.">
              <div className="grid gap-3">
                <Link href="/moderation" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Review listings
                </Link>
                <Link href="/categories" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage categories
                </Link>
                <Link href="/settings" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Account settings
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {!loading && error === null && data?.kind === 'admin' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total users" value={data.data.users.totalUsers} hint="All registered accounts" accent="from-blue-600 to-cyan-500" />
            <MetricCard label="Active users" value={data.data.users.activeUsers} hint="Currently active accounts" accent="from-emerald-500 to-green-400" />
            <MetricCard label="Pending reviews" value={data.data.moderation.pendingReviews} hint="Moderation backlog" accent="from-amber-500 to-orange-400" />
            <MetricCard label="Audit logs" value={data.data.system.auditLogsGenerated} hint="System events generated" accent="from-fuchsia-500 to-violet-500" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Platform overview" subtitle="High-level platform health and content status.">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Organizations</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.data.organizations.totalOrganizations}</p>
                  <p className="mt-1 text-sm text-slate-500">{data.data.organizations.activeOrganizations} active</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Listings</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.data.listings.totalListings}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {data.data.listings.pendingListings} pending, {data.data.listings.approvedListings} approved
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Blocked users</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.data.users.blockedUsers}</p>
                  <p className="mt-1 text-sm text-slate-500">Accounts needing attention</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Notifications sent</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{data.data.system.notificationsSent}</p>
                  <p className="mt-1 text-sm text-slate-500">Across the platform</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Quick actions" subtitle="Administrative shortcuts.">
              <div className="grid gap-3">
                <Link href="/admin" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Admin home
                </Link>
                <Link href="/admin/users" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage users
                </Link>
                <Link href="/admin/organizations" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage organizations
                </Link>
                <Link href="/moderation" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Review listings
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
