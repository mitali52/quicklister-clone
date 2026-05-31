'use client';

import { useState } from 'react';
import { useDeleteAccount } from '../_hooks/useProfile';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export function DangerZone() {
  const [confirmed, setConfirmed] = useState(false);
  const deleteAccount = useDeleteAccount();

  const apiErrorMessage =
    deleteAccount.error instanceof ApiError ? deleteAccount.error.message : null;
  const serverError =
    deleteAccount.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  async function handleDelete() {
    if (!confirmed) return;
    await deleteAccount.mutateAsync();
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
      <h3 className="text-base font-semibold text-red-700">Delete account</h3>
      <p className="mt-1.5 text-sm text-slate-600 max-w-prose">
        Once you delete your account, all your listings, messages, and data will be permanently
        removed. This action cannot be undone.
      </p>

      <div className="mt-4 flex items-start gap-3">
        <input
          id="confirm-delete"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          aria-describedby="confirm-delete-label"
        />
        <label
          id="confirm-delete-label"
          htmlFor="confirm-delete"
          className="text-sm text-slate-700 cursor-pointer"
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
        disabled={!confirmed || deleteAccount.isPending}
        onClick={() => void handleDelete()}
        className={cn(
          'mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
          !confirmed || deleteAccount.isPending
            ? 'bg-red-300 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700',
        )}
      >
        {deleteAccount.isPending ? 'Deleting account…' : 'Delete my account'}
      </button>
    </div>
  );
}
