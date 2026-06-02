import type { Metadata } from 'next';
import Link from 'next/link';
import { PortalLogosSection } from '../_components/PortalLogosSection';
import { WhySection } from '../_components/WhySection';

export const metadata: Metadata = {
  title: 'Commercial',
  description: 'Commercial property sales and lettings with direct-owner control.',
};

function FeatureCard({ title, copy }: Readonly<{ title: string; copy: string }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
    </div>
  );
}

export default function CommercialPage() {
  return (
    <div>
      <section className="bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Commercial
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Commercial property marketing that stays in your hands.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Advertise offices, retail, industrial, and mixed-use spaces with a direct-to-owner
              workflow built for clarity and speed.
            </p>
          </div>
        </div>
      </section>

      <PortalLogosSection />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <FeatureCard
            title="Commercial sale"
            copy="Present your premises clearly, qualify leads faster, and keep every update in one place."
          />
          <FeatureCard
            title="Commercial let"
            copy="Advertise available units to the right audience and manage viewings without extra admin."
          />
          <FeatureCard
            title="Support when needed"
            copy="Keep control of the listing while getting help from property experts whenever you need it."
          />
        </div>
      </section>

      <WhySection />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to market your commercial property?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create an account, build your listing, and get moving with Quicklister.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Free Sign Up
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
