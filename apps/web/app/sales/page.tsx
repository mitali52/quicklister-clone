import type { Metadata } from 'next';
import { LettingsSalesSection } from '../_components/LettingsSalesSection';
import { PortalLogosSection } from '../_components/PortalLogosSection';
import { TestimonialsSection } from '../_components/TestimonialsSection';

export const metadata: Metadata = {
  title: 'Sales',
  description: 'Sell your property direct to buyers and keep your sale moving online.',
};

export default function SalesPage() {
  return (
    <div>
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Sales
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Put your property in front of more buyers, without the big commission.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Manage the full sales journey in one place, from listing creation to viewing requests
              and onward progression.
            </p>
          </div>
        </div>
      </section>

      <PortalLogosSection />
      <LettingsSalesSection />
      <TestimonialsSection />
    </div>
  );
}
