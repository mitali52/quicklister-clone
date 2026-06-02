import type { Metadata } from 'next';
import { PlatformSection } from '../_components/PlatformSection';
import { WhySection } from '../_components/WhySection';
import { CtaSection } from '../_components/CtaSection';

export const metadata: Metadata = {
  title: 'The Platform',
  description: 'See how Quicklister helps you create, manage, and market property listings.',
};

export default function ThePlatformPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              The Platform
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              List faster, market smarter, and stay in control.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">
              Quicklister gives owners and landlords the tools to build listings, manage enquiries,
              and keep momentum from first enquiry through to completion.
            </p>
          </div>
        </div>
      </section>

      <PlatformSection />
      <WhySection />
      <CtaSection />
    </div>
  );
}
