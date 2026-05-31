'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ForgotPasswordSchema, type ForgotPassword } from '@/lib/schemas/auth.schemas';
import { FormField } from '@/components/ui/FormField';

type FormState = 'idle' | 'submitting' | 'sent';

export function ForgotPasswordForm() {
  const [state, setState] = useState<FormState>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPassword>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPassword) {
    setState('submitting');
    setSubmittedEmail(data.email);
    // Simulate network request — replace with real API call when endpoint is available
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setState('sent');
  }

  if (state === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">Check your inbox</p>
          <p className="mt-1 text-sm text-slate-500">
            If an account with{' '}
            <span className="font-medium text-slate-700">{submittedEmail}</span> exists,
            you&apos;ll receive a reset link shortly.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="mt-1 w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'submitting' ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
