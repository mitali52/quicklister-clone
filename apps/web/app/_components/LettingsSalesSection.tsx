import Link from 'next/link';

function EnquiryCard({ name, message }: Readonly<{ name: string; message: string }>) {
  return (
    <div className="absolute rounded-xl bg-white p-3 shadow-lg">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-cyan-400" />
        <div>
          <p className="text-xs font-semibold text-slate-800">{name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
}

function LettingsVisual() {
  return (
    <div className="relative h-80 lg:h-96">
      {/* Background photo placeholder */}
      <div className="absolute right-0 top-0 h-72 w-56 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 lg:w-64">
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="h-16 w-16 rounded-full bg-slate-400 opacity-50" />
          <div className="h-3 w-24 rounded bg-slate-400 opacity-40" />
        </div>
      </div>
      {/* Phone mockup overlay */}
      <div className="absolute left-0 bottom-4 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:w-52">
        <div className="bg-indigo-600 px-3 py-2">
          <div className="h-2.5 w-20 rounded bg-white opacity-70" />
        </div>
        <div className="space-y-2 p-3">
          {['Rightmove', 'Zoopla', 'OnTheMarket'].map((portal) => (
            <div key={portal} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1.5">
              <div className="h-2 w-16 rounded bg-slate-200" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
          ))}
          <div className="mt-2 rounded-lg bg-cyan-500 py-2 text-center">
            <div className="mx-auto h-2 w-16 rounded bg-white opacity-80" />
          </div>
        </div>
      </div>
      {/* Enquiry notification */}
      <EnquiryCard
        name="James Baker"
        message="Hi, I'm interested in viewing. Please can you send me some more data."
      />
    </div>
  );
}

function SalesVisual() {
  return (
    <div className="relative h-80 lg:h-96">
      {/* Background photo placeholder */}
      <div className="absolute left-0 top-0 h-72 w-56 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-slate-200 lg:w-64">
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="h-16 w-16 rounded-full bg-blue-300 opacity-60" />
          <div className="h-3 w-24 rounded bg-slate-300 opacity-50" />
        </div>
      </div>
      {/* Listing card overlay */}
      <div className="absolute right-0 top-8 w-48 overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="h-20 bg-gradient-to-br from-blue-200 to-slate-200" />
        <div className="p-3">
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="mt-1 h-2.5 w-16 rounded bg-slate-300" />
          <div className="mt-2 flex gap-1">
            {['Rightmove', 'Zoopla'].map((p) => (
              <div key={p} className="h-4 w-14 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
      {/* Enquiry notification */}
      <div className="absolute bottom-4 right-0">
        <EnquiryCard
          name="Ashley Auchie"
          message="Hi, I'm interested in a viewing, please can you send me some more."
        />
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function LettingsSalesSection() {
  return (
    <section aria-label="Lettings and Sales">
      {/* Lettings — lavender/purple bg */}
      <div className="bg-purple-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
                Let your Property
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Find your next tenants without High Street fees.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                With Quicklister you can list your rental property, arrange viewings, and get
                credit and reference reports (additional charge applies).
              </p>
              <Link
                href="/lettings"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
              >
                Get Started <ArrowIcon />
              </Link>
            </div>
            <LettingsVisual />
          </div>
        </div>
      </div>

      {/* Sales — white bg */}
      <div className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <SalesVisual />
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                Sell your Property
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sell your property your way with Quicklister.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Create your property ad, arrange viewings with interested buyers and let us
                instruct the solicitors once an offer has been agreed.
              </p>
              <Link
                href="/sales"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
              >
                Get Started <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
