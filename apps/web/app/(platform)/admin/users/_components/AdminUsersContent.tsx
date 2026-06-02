'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import {
  activateAdminUserApi,
  getAdminUsersApi,
  suspendAdminUserApi,
} from '@/lib/api/admin.api';
import {
  ErrorState,
  EmptyState,
  PaginationBar,
  PageHeader,
  StatusPill,
  TableSkeleton,
  formatDate,
} from '../../_components/AdminUi';

const USERS_QUERY_KEY = ['admin', 'users'] as const;

function UsersToolbar({
  search,
  roleName,
  suspended,
  onSearchChange,
  onRoleChange,
  onSuspendedChange,
  onApply,
}: {
  search: string;
  roleName: string;
  suspended: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSuspendedChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_180px_180px_120px]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or email"
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
      <select
        value={roleName}
        onChange={(event) => onRoleChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>
      <select
        value={suspended}
        onChange={(event) => onSuspendedChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <option value="">All accounts</option>
        <option value="true">Suspended</option>
        <option value="false">Active</option>
      </select>
      <button
        type="button"
        onClick={onApply}
        className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Apply
      </button>
    </div>
  );
}

export function AdminUsersContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [roleNameInput, setRoleNameInput] = useState('');
  const [suspendedInput, setSuspendedInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleName, setRoleName] = useState('');
  const [suspended, setSuspended] = useState('');

  const query = useMemo(
    () => ({
      search,
      roleName,
      suspended: suspended === '' ? undefined : suspended === 'true',
      page,
      limit: 10,
    }),
    [page, roleName, search, suspended],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [...USERS_QUERY_KEY, query],
    queryFn: () => getAdminUsersApi(query),
  });

  const mutateUser = useMutation({
    mutationFn: async ({ id, suspendedState }: { id: string; suspendedState: boolean }) =>
      suspendedState ? suspendAdminUserApi(id) : activateAdminUserApi(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const apiError = error instanceof ApiError ? error.message : null;

  function applyFilters() {
    setSearch(searchInput.trim());
    setRoleName(roleNameInput);
    setSuspended(suspendedInput);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="User management"
        subtitle="Search accounts, review permissions, and suspend or reactivate users when needed."
      />

      <div className="mt-6 space-y-6">
        <UsersToolbar
          search={searchInput}
          roleName={roleNameInput}
          suspended={suspendedInput}
          onSearchChange={setSearchInput}
          onRoleChange={setRoleNameInput}
          onSuspendedChange={setSuspendedInput}
          onApply={applyFilters}
        />

        {isLoading && <TableSkeleton columns={6} rows={6} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Failed to load users."
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
            title="No users found"
            description="Try adjusting the search or filter criteria."
          />
        )}

        {!isLoading && !apiError && data && data.data.length > 0 && (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Verified</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((user) => (
                      <tr key={user.id} className="align-top">
                        <td className="px-5 py-4">
                          <Link href={`/admin/users/${user.id}`} className="font-semibold text-slate-900 hover:text-slate-700">
                            {user.fullName}
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={user.roleName} tone={user.roleName === 'admin' ? 'violet' : user.roleName === 'moderator' ? 'blue' : 'slate'} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={user.suspended ? 'Suspended' : 'Active'} tone={user.suspended ? 'red' : 'green'} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={user.emailVerified ? 'Verified' : 'Unverified'} tone={user.emailVerified ? 'green' : 'amber'} />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${user.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              View
                            </Link>
                            <button
                              type="button"
                              disabled={mutateUser.isPending || user.roleName === 'admin'}
                              onClick={() => void mutateUser.mutateAsync({ id: user.id, suspendedState: !user.suspended })}
                              className={[
                                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                                user.roleName === 'admin'
                                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                  : user.suspended
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-red-600 text-white hover:bg-red-700',
                              ].join(' ')}
                            >
                              {user.suspended ? 'Activate' : 'Suspend'}
                            </button>
                          </div>
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
