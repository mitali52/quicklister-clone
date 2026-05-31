'use client';

import Link from 'next/link';
import type { Organization } from '@/lib/api/organizations.api';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const initials = organization.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <Link
      href={`/organizations/${organization.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {organization.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organization.logoUrl}
            alt={`${organization.name} logo`}
            className="h-12 w-12 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{organization.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">/{organization.slug}</p>
          {organization.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{organization.description}</p>
          )}
        </div>
      </div>

      {organization.websiteUrl && (
        <p className="mt-3 truncate text-xs text-blue-600">{organization.websiteUrl}</p>
      )}
    </Link>
  );
}
