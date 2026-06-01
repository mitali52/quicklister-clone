'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'unauthenticated' && !accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router, status]);

  if (status === 'loading' || !accessToken) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-cyan-100" />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Loading your dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;re restoring your session and preparing your workspace.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
