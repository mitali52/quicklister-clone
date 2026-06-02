'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getAdminAuditLogsApi } from '@/lib/api/admin.api';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  TableSkeleton,
  formatDate,
} from '../../_components/AdminUi';

const AUDIT_QUERY_KEY = ['admin', 'audit-logs'] as const;

export function AdminAuditLogsContent() {
  const [page, setPage] = useState(1);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [resourceTypeInput, setResourceTypeInput] = useState('');
  const [resourceIdInput, setResourceIdInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [adminId, setAdminId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [action, setAction] = useState('');

  const query = useMemo(
    () => ({
      adminId,
      resourceType,
      resourceId,
      action,
      page,
      limit: 10,
    }),
    [action, adminId, page, resourceId, resourceType],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [...AUDIT_QUERY_KEY, query],
    queryFn: () => getAdminAuditLogsApi(query),
  });

  const apiError = error instanceof ApiError ? error.message : null;

  function applyFilters() {
    setAdminId(adminIdInput.trim());
    setResourceType(resourceTypeInput.trim());
    setResourceId(resourceIdInput.trim());
    setAction(actionInput.trim());
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="Audit logs"
        subtitle="Track security, moderation, and admin activity across the platform."
      />

      <div className="mt-6 space-y-6">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_120px]">
          <input
            value={adminIdInput}
            onChange={(event) => setAdminIdInput(event.target.value)}
            placeholder="Filter by admin user ID"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={resourceTypeInput}
            onChange={(event) => setResourceTypeInput(event.target.value)}
            placeholder="Resource type"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={resourceIdInput}
            onChange={(event) => setResourceIdInput(event.target.value)}
            placeholder="Resource ID"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={actionInput}
            onChange={(event) => setActionInput(event.target.value)}
            placeholder="Action"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply
          </button>
        </div>

        {isLoading && <TableSkeleton columns={6} rows={6} />}

        {!isLoading && apiError && (
          <ErrorState
            title="Failed to load audit logs."
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
            title="No audit events found"
            description="Try clearing the filters or widening the date/action scope."
          />
        )}

        {!isLoading && !apiError && data && data.data.length > 0 && (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Resource</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">IP</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((log) => (
                      <tr key={log.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{log.action}</p>
                          <p className="mt-1 text-xs text-slate-500">{log.id}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{log.entityType}</p>
                          <p className="mt-1 text-slate-500">{log.entityId}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">{log.userId}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{log.ipAddress ?? 'N/A'}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{formatDate(log.createdAt)}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          <pre className="max-w-[24rem] overflow-auto rounded-2xl bg-slate-50 p-3">
                            {JSON.stringify({ oldValues: log.oldValues, newValues: log.newValues }, null, 2)}
                          </pre>
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
