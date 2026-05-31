import Link from 'next/link';

function PlatformUI() {
  return (
    <div className="relative">
      {/* Main platform screenshot */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-400">
            platform.quicklister.co.uk/listings/new
          </div>
        </div>
        <div className="flex">
          {/* Sidebar */}
          <div className="w-36 flex-shrink-0 border-r border-slate-100 bg-slate-50 p-3">
            <div className="mb-4 h-5 w-20 rounded bg-indigo-600" />
            <div className="space-y-2">
              {['dashboard', 'properties', 'messages', 'viewings', 'billing'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-slate-200" />
                  <div className="h-2.5 flex-1 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
          {/* Form area */}
          <div className="flex-1 p-4">
            <div className="mb-4 h-5 w-40 rounded bg-slate-200" />
            {/* Property type buttons */}
            <div className="mb-3 flex gap-2">
              <div className="h-7 w-20 rounded-full bg-indigo-600" />
              <div className="h-7 w-20 rounded-full bg-slate-100" />
              <div className="h-7 w-20 rounded-full bg-slate-100" />
            </div>
            {/* Form fields */}
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-slate-200" />
              <div className="h-8 rounded-lg border border-slate-200 bg-white" />
              <div className="h-2.5 w-32 rounded bg-slate-200" />
              <div className="h-16 rounded-lg border border-slate-200 bg-white" />
            </div>
            {/* Image drop zone */}
            <div className="mt-3 rounded-lg border-2 border-dashed border-cyan-300 bg-cyan-50 p-4 text-center">
              <div className="mx-auto mb-1 h-6 w-6 rounded bg-cyan-400 opacity-70" />
              <div className="mx-auto h-2 w-32 rounded bg-cyan-300 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Google rating overlay */}
      <div className="absolute -bottom-4 left-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg">
        <span className="text-sm font-bold text-slate-800">Google</span>
        <div className="flex items-center gap-0.5">
          {['s1', 's2', 's3', 's4', 's5'].map((star) => (
            <svg key={star} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlatformSection() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="platform-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left — platform UI */}
          <div className="pb-6">
            <PlatformUI />
          </div>

          {/* Right — text */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              The Platform
            </span>
            <h2
              id="platform-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Listing is easy!
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Describe your property features, drag and drop your property images and get ready
              for the enquiries!
            </p>
            <Link
              href="/the-platform"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              How it Works
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
