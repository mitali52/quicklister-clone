import Link from 'next/link';

function ArrowIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function CtaSection() {
  return (
    <section
      className="bg-gradient-to-r from-cyan-500 to-teal-500 py-20 sm:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Supercharge your property ad on the UK&apos;s biggest property websites.
          </h2>
          <p className="mt-4 text-base font-medium text-cyan-50">Ready to get Started?</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/lettings"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition-colors hover:bg-cyan-50"
            >
              Lettings <ArrowIcon />
            </Link>
            <Link
              href="/sales"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition-colors hover:bg-cyan-50"
            >
              Sales <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
