'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/FormField';
import { resetPasswordApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/client';
import {
  ResetPasswordSchema,
  type ResetPassword,
} from '@/lib/schemas/auth.schemas';

type FormState = 'idle' | 'submitting' | 'done';

export function ResetPasswordForm({ token }: Readonly<{ token: string }>) {
  const router = useRouter();
  const [state, setState] = useState<FormState>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  async function onSubmit(data: ResetPassword) {
    setFormError(null);
    try {
      setState('submitting');
      await resetPasswordApi(data);
      setState('done');
    } catch (err) {
      setState('idle');
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setFormError('This reset link is invalid or has expired. Please request a new one.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">Missing reset token</p>
        <p className="mt-2">
          Open the password reset link from your email or request a new one from the sign-in page.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/forgot-password" className="font-semibold text-blue-700 hover:underline">
            Request a new link
          </Link>
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-lg font-bold text-emerald-900">Password updated</p>
        <p className="mt-2 text-sm text-emerald-800">
          Your password has been reset successfully. You can now sign in with the new password.
        </p>
        <button
          type="button"
          onClick={() => router.replace('/login')}
          className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('token')} />

      <FormField
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter a new password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {formError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'submitting' ? 'Updating…' : 'Update password'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Remembered your password?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
