'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

type RoleName = 'admin' | 'moderator' | 'user';

interface RoleGuardProps {
  allowedRoles: RoleName[];
  fallbackPath?: string;
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, fallbackPath = '/welcome', children }: Readonly<RoleGuardProps>) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const roleName = useAuthStore((state) => state.user?.roleName) as RoleName | undefined;

  const isAllowed = roleName !== undefined && allowedRoles.includes(roleName);

  useEffect(() => {
    if (status === 'authenticated' && !isAllowed) {
      router.replace(fallbackPath);
    }
  }, [fallbackPath, isAllowed, router, status]);

  if (status === 'loading' || !isAllowed) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-cyan-100" />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Checking access</h1>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;re verifying the permissions for this workspace.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
