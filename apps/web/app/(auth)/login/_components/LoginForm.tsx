'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginSchema, type Login } from '@/lib/schemas/auth.schemas';
import { loginApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ApiError } from '@/lib/api/client';
import { ArrowCircleIcon, EyeIcon } from '@/app/_components/auth/AuthIcons';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Login>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: Login) {
    setFormError(null);
    try {
      const response = await loginApi(data);
      setAuth(response);
      router.replace('/welcome');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        setFormError('Incorrect email or password. Please try again.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label className="relative block">
          <span className="absolute -top-3 left-4 bg-white px-1 text-[15px] font-medium text-slate-700">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            placeholder=""
            className={[
              'h-14 w-full rounded-md border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition',
              'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
              errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : '',
            ].join(' ')}
            {...register('email')}
          />
        </label>
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="relative block">
          <span className="absolute -top-3 left-4 bg-white px-1 text-[15px] font-medium text-slate-700">
            Password
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder=""
            className={[
              'h-14 w-full rounded-md border border-slate-200 bg-white px-4 pr-14 text-[15px] text-slate-900 outline-none transition',
              'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
              errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : '',
            ].join(' ')}
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </label>
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="pt-1">
        <Link
          href="/forgot-password"
          className="text-base font-medium text-slate-900 underline decoration-slate-900 underline-offset-2 hover:text-slate-700"
        >
          Forgotten your password?
        </Link>
      </div>

      {formError !== null && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-8 py-4 text-lg font-extrabold text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          <ArrowCircleIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}
