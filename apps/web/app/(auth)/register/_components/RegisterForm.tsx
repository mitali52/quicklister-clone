'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ApiError } from '@/lib/api/client';
import { ArrowCircleIcon, EyeIcon } from '@/app/_components/auth/AuthIcons';
import { z as zod } from 'zod';

const RegisterFormSchema = zod
  .object({
    email: zod.string().email('Enter a valid email address'),
    password: zod
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: zod.string().min(1, 'Confirm your password'),
    acceptTerms: zod.boolean().refine((value) => value, {
      message: 'Please confirm you are not listing on behalf of an agency.',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type RegisterFormValues = zod.infer<typeof RegisterFormSchema>;

function deriveFullName(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Quicklister User';
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setFormError(null);

    try {
      const response = await registerApi({
        email: data.email,
        password: data.password,
        fullName: deriveFullName(data.email),
        phoneNumber: undefined,
      });
      setAuth(response);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError('An account with this email already exists. Sign in instead?');
      } else if (err instanceof ApiError && err.status === 400) {
        setFormError('Please check the details you entered and try again.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-500">
          Email <span className="text-slate-400">*</span>
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder=""
          className={[
            'h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition',
            'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
            errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : '',
          ].join(' ')}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-500">
          Password <span className="text-slate-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder=""
            className={[
              'h-14 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-[15px] text-slate-900 outline-none transition',
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
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-500">
          Confirm Password <span className="text-slate-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder=""
            className={[
              'h-14 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-[15px] text-slate-900 outline-none transition',
              'focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
              errors.confirmPassword
                ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200'
                : '',
            ].join(' ')}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-3 text-[15px] leading-7 text-slate-600">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-300"
            {...register('acceptTerms')}
          />
          <span>
            I confirm that I will not be listing property on behalf of an estate or letting
            agency in the UK
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1.5 text-xs text-rose-600" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      {formError !== null && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <div className="pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-3 rounded-full bg-slate-800 px-8 py-4 text-lg font-extrabold text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isSubmitting ? 'Creating account...' : 'Sign Up'}</span>
          <ArrowCircleIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}
