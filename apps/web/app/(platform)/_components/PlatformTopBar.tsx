'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { logoutApi } from '@/lib/api/auth.api';

export function PlatformTopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleSignOut() {
    try {
      await logoutApi();
    } catch {
      // Ignore logout API errors — clear client state regardless
    } finally {
      clearAuth();
      router.replace('/login');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-blue-700 tracking-tight">
          Quicklister
        </Link>

        <div className="flex items-center gap-4">
          {user !== null && (
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.email}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
