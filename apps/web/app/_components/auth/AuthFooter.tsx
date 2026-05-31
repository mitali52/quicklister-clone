import Link from 'next/link';

function LegalLinks() {
  return (
    <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Link
        href="/terms-and-conditions"
        className="text-xs text-slate-600 underline hover:text-slate-900"
      >
        Terms and conditions
      </Link>
      <Link
        href="/cookie-policy"
        className="text-xs text-slate-600 underline hover:text-slate-900"
      >
        Cookie policy
      </Link>
      <Link
        href="/privacy-policy"
        className="text-xs text-slate-600 underline hover:text-slate-900"
      >
        Privacy policy
      </Link>
    </nav>
  );
}

function StripeBadge({ variant = 'light' }: { variant?: 'light' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-4xl font-black tracking-tight text-indigo-500">stripe</span>
        <div className="h-16 w-px bg-slate-200" />
        <p className="max-w-24 text-sm leading-tight text-slate-400">Secure payments partner</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-5xl font-black tracking-tight text-indigo-500">stripe</span>
      <div className="h-16 w-px bg-slate-200" />
      <p className="max-w-24 text-sm leading-tight text-slate-400">Secure payments partner</p>
    </div>
  );
}

export function LoginAuthFooter() {
  return (
    <footer className="mt-auto border-t border-transparent px-6 pb-6 pt-16 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <LegalLinks />
          <p className="text-xs text-slate-900">Copyright &copy; QuicklisterPro 2026</p>
        </div>
        <div className="self-start lg:self-auto">
          <StripeBadge />
        </div>
      </div>
    </footer>
  );
}

export function RegisterAuthFooter() {
  return (
    <footer className="mt-auto border-t border-transparent px-6 pb-6 pt-12 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <LegalLinks />
          <p className="text-xs text-slate-900">Copyright &copy; QuicklisterPro 2025</p>
        </div>

        <div className="flex flex-wrap items-end justify-start gap-6 lg:justify-end">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="flex h-10 w-8 items-end justify-center gap-0.5 border-l-[4px] border-b-[4px] border-r-[4px] border-transparent border-l-violet-500 border-b-fuchsia-400 border-r-slate-800 pb-1">
              <span className="h-5 w-1 bg-slate-700" />
              <span className="h-7 w-1 bg-violet-500" />
              <span className="h-9 w-1 bg-fuchsia-400" />
            </span>
            <span className="text-3xl leading-none">
              <span className="block font-medium">Property</span>
              <span className="block font-medium">Redress</span>
            </span>
          </div>
          <StripeBadge variant="compact" />
        </div>
      </div>
    </footer>
  );
}
