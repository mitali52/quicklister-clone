'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProfile } from '../_hooks/useProfile';
import { AvatarUpload } from './AvatarUpload';
import { ProfileForm } from './ProfileForm';
import { DangerZone } from './DangerZone';

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

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading profile">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
      </div>
      <div className="space-y-4">
        {['a', 'b', 'c', 'd'].map((k) => (
          <div key={k} className="h-10 rounded-lg bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function SettingsContent() {
  const { data: profile, isLoading, error } = useProfile();

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

        {/* Main content */}
        <div className="flex-1 space-y-8">
          {isLoading && <ProfileSkeleton />}

          {error !== null && !isLoading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
              <p className="text-sm font-medium text-red-700">Failed to load your profile.</p>
              <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
            </div>
          )}

          {profile !== undefined && (
            <>
              {/* Avatar */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-slate-800">Profile photo</h2>
                <AvatarUpload profile={profile} />
              </section>

              {/* Profile info */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-slate-800">
                  Personal information
                </h2>
                <ProfileForm profile={profile} />
              </section>

              {/* Danger zone */}
              <section>
                <h2 className="mb-4 text-base font-semibold text-slate-800">Danger zone</h2>
                <DangerZone />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
