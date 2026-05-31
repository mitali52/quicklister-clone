'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChangePasswordSchema, type ChangePassword } from '@/lib/schemas/profile.schemas';
import { FormField } from '@/components/ui/FormField';
import { ApiError } from '@/lib/api/client';
import { useChangePassword } from '../../_hooks/useProfile';
import { cn } from '@/lib/utils';

const settingsNav = [
  { label: 'Profile', href: '/settings' },
  { label: 'Password', href: '/settings/password' },
] as const;

function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings navigation">
      <ul className="flex flex-row gap-1 sm:flex-col">
        {settingsNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ChangePasswordForm() {
  const [success, setSuccess] = useState(false);
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePassword>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  async function onSubmit(data: ChangePassword) {
    setSuccess(false);
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    reset();
    setSuccess(true);
  }

  const apiErrorMessage =
    changePassword.error instanceof ApiError ? changePassword.error.message : null;
  const serverError =
    changePassword.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile and account preferences.</p>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
        {/* Sidebar nav */}
        <aside className="shrink-0 sm:w-44">
          <SettingsNav />
        </aside>

        {/* Change password card */}
        <div className="flex-1">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1.5 text-base font-semibold text-slate-800">Change password</h2>
            <p className="mb-6 text-sm text-slate-500">
              Choose a strong password of at least 8 characters.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField
                label="Current password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />

              <FormField
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <p className="-mt-3 text-xs text-slate-400">Must be at least 8 characters.</p>

              <FormField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {serverError !== null && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {serverError}
                </p>
              )}

              {success && (
                <p
                  className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  role="status"
                >
                  Password changed successfully. Sign in with your new password next time.
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || changePassword.isPending}
                  className={cn(
                    'rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
                    isSubmitting || changePassword.isPending
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800',
                  )}
                >
                  {isSubmitting || changePassword.isPending ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
