'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMyProfileApi } from '@/lib/api/users.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { SUPPORT_WHATSAPP_HREF } from '@/lib/support-links';

const steps = [
  {
    title: 'Click "Add a Property" and choose a plan',
    body: 'Select a marketing plan that suits your needs. Choose from our range of plans designed for sales, lettings or commercial properties.',
    time: 'Takes 3 minutes',
  },
  {
    title: 'Add Property Information',
    body: 'Enter the details about your property including the address, property type, bedrooms, price, and description. Upload photos to showcase your property.',
    time: 'Takes 5 minutes',
  },
  {
    title: 'Verify ID & Property Ownership',
    body: 'Verify your identity via SMS and upload your proof of ownership documentation when you are ready to publish.',
    time: 'Takes 5 minutes',
  },
  {
    title: 'Make Payment',
    body: 'Complete payment for your selected plan and any optional extras using a credit or debit card.',
    time: 'Takes 1 minute',
  },
  {
    title: 'Submit for Marketing',
    body: 'After payment, submit your property for publication on our partner marketing portals including Rightmove, Zoopla, and OnTheMarket.',
    time: 'Takes 1 minute',
  },
  {
    title: 'Admin Review & Publication',
    body: 'Our admin team reviews your listing and publishes it live on the portals. You will receive an email notification once it is live.',
    time: 'Handled by the Quicklister Support Team',
  },
];

function StepCard({
  index,
  title,
  body,
  time,
}: Readonly<{ index: number; title: string; body: string; time: string }>) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-lg bg-slate-800 px-3 py-1 text-sm font-semibold text-white">
            Step {index}
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
          {time}
        </div>
      </div>
    </article>
  );
}

export function WelcomeContent() {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getMyProfileApi,
    staleTime: 60_000,
  });

  const displayName = profile?.fullName ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-slate-100 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome to QuicklisterPro, {displayName}!
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-500">
              Follow the steps below to create a listing and get your first property live. It only
              takes about 15 minutes!
            </p>
          </div>
          <Link
            href={SUPPORT_WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-50"
          >
            Need Help?
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/listings/new"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-300"
          >
            + Add First Property
          </Link>
          <Link
            href="/property-valuation"
            className="inline-flex items-center justify-center rounded-full border-2 border-cyan-400 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-cyan-50"
          >
            + Get a Valuation Estimate
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">About 15 minutes left</p>
      </section>

      <section className="mt-8 space-y-0">
        {steps.map((step, index) => (
          <StepCard key={step.title} index={index + 1} {...step} />
        ))}
      </section>
    </div>
  );
}
