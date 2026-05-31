import Link from 'next/link';

function PropertyPhoto() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-slate-200 lg:h-80">
      {/* Simulated interior photo */}
      <div className="flex h-full min-h-64 flex-col justify-end p-6">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-400 opacity-40" />
          <div className="h-2.5 w-24 rounded bg-slate-400 opacity-30" />
        </div>
      </div>
      {/* Valuation badge overlay */}
      <div className="absolute right-4 top-4 rounded-xl bg-white p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500">Estimated value</p>
        <p className="text-xl font-extrabold text-indigo-700">£425,000</p>
        <p className="text-xs text-slate-400">Based on recent sales</p>
      </div>
    </div>
  );
}

export function InstantValuationSection() {
  return (
    <section className="bg-purple-50 py-20 sm:py-24" aria-labelledby="valuation-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              Instant Valuation
            </span>
            <h2
              id="valuation-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Need to check your property&apos;s value?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Get an indicative value range in seconds using up to date market data.
            </p>
            <Link
              href="/valuation"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
            >
              Get Instant Valuation
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <PropertyPhoto />
        </div>
      </div>
    </section>
  );
}
