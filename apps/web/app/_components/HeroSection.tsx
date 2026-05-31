import Link from 'next/link';

function ProductScreenshot() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 rounded bg-white px-3 py-1 text-xs text-slate-400">
          platform.quicklister.co.uk
        </div>
      </div>
      {/* Sidebar + content */}
      <div className="flex min-h-[320px]">
        {/* Sidebar */}
        <div className="w-40 flex-shrink-0 border-r border-slate-100 bg-white p-3">
          <div className="mb-3 h-6 w-24 rounded bg-indigo-600" />
          <div className="space-y-1.5">
            {['Dashboard', 'My Properties', 'Messages', 'Viewings', 'Billing'].map((item) => (
              <div key={item} className="h-6 w-full rounded bg-slate-100" />
            ))}
          </div>
          <div className="mt-4 h-8 w-full rounded-full bg-cyan-500" />
        </div>
        {/* Main content */}
        <div className="flex-1 bg-slate-50 p-4">
          <div className="mb-3 h-5 w-32 rounded bg-slate-300" />
          {/* Property cards */}
          <div className="space-y-2">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-16 flex-shrink-0 rounded bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                  <div className="h-2.5 w-20 rounded bg-slate-100" />
                  <div className="h-2.5 w-16 rounded bg-cyan-200" />
                </div>
                <div className="h-5 w-12 rounded-full bg-green-100" />
              </div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-16 flex-shrink-0 rounded bg-blue-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-slate-200" />
                  <div className="h-2.5 w-24 rounded bg-slate-100" />
                  <div className="h-2.5 w-16 rounded bg-cyan-200" />
                </div>
                <div className="h-5 w-12 rounded-full bg-yellow-100" />
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['Views', 'Enquiries', 'Viewings'].map((label) => (
              <div key={label} className="rounded-lg bg-white p-2 text-center shadow-sm">
                <div className="mx-auto mb-1 h-4 w-8 rounded bg-cyan-400" />
                <div className="mx-auto h-2 w-10 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-blue-900 py-16 sm:py-20 lg:py-24"
      aria-label="Hero"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — text */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-4 py-1.5 text-sm font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true"></span>No agents commission
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Take control of your property marketing.
            </h1>
            <p className="mt-5 text-base leading-7 text-blue-200">
              The Quicklister Pro platform lets you list your property on the major property
              sites from anywhere in the UK. Property experts are on hand to support your
              transaction from start to finish.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register?type=sale"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-cyan-400"
              >
                I want to sell my property
              </Link>
              <Link
                href="/register?type=let"
                className="inline-flex items-center gap-2 rounded-full border-2 border-cyan-400 px-6 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10"
              >
                I want to let my property
              </Link>
            </div>
          </div>

          {/* Right — product screenshot */}
          <div className="relative">
            <ProductScreenshot />
            {/* Video play overlay badge */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500">
                <svg
                  className="h-4 w-4 translate-x-0.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Watch how it works</p>
                <p className="text-xs text-slate-400">2 min overview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
