import type { Metadata } from 'next';
import Link from 'next/link';
import { InstantValuationSection } from '../_components/InstantValuationSection';

export const metadata: Metadata = {
  title: 'Valuation',
  description: 'Get an instant property valuation overview for your home or rental property.',
};

export default function ValuationPage() {
  return (
    <div>
      <section className="bg-amber-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
              Valuation
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              See what your property could be worth.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Use market signals and recent activity to get an indicative value before you list.
            </p>
          </div>
        </div>
      </section>

      <InstantValuationSection />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to move from valuation to listing?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create an account and start marketing your property in minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Free Sign Up
          </Link>
        </div>
      </section>
    </div>
  );
}
