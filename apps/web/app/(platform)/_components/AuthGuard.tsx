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

  if (status === 'loading') return null;
  if (!accessToken) return null;

  return <>{children}</>;
}
