'use client';

import Link from 'next/link';
import { OrganizationForm } from '../../_components/OrganizationForm';
import { useCreateOrganization } from '../../_hooks/useOrganizations';
import type { CreateOrganization } from '@/lib/schemas/organization.schemas';

export function CreateOrganizationContent() {
  const createOrganization = useCreateOrganization();

  async function handleSubmit(data: CreateOrganization) {
    await createOrganization.mutateAsync(data);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/organizations"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to organizations
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create organization</h1>
        <p className="mt-1 text-sm text-slate-500">
          Organizations let you group listings and collaborate with your team.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <OrganizationForm
          mode="create"
          onSubmit={handleSubmit}
          isPending={createOrganization.isPending}
          error={createOrganization.error}
        />
      </section>
    </div>
  );
}
