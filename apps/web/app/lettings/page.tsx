import type { Metadata } from 'next';
import { LettingsSalesSection } from '../_components/LettingsSalesSection';
import { TestimonialsSection } from '../_components/TestimonialsSection';
import { CtaSection } from '../_components/CtaSection';

export const metadata: Metadata = {
  title: 'Lettings',
  description: 'List rental property without high street fees and reach tenants faster.',
};

export default function LettingsPage() {
  return (
    <div>
      <section className="bg-purple-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Lettings
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find tenants without the usual commission-heavy process.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Build your listing, receive enquiries around the clock, and manage the process from
              your own dashboard.
            </p>
          </div>
        </div>
      </section>

      <LettingsSalesSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
