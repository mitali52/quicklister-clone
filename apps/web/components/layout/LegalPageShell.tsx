import Link from 'next/link';

interface LegalPageShellProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPageShell({ title, lastUpdated, children }: Readonly<LegalPageShellProps>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Quicklister
          </Link>
          <div className="mt-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">Legal</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {title}
            </h1>
            {lastUpdated !== undefined && lastUpdated !== '' && (
              <p className="mt-3 text-sm text-slate-500">Last updated: {lastUpdated}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
