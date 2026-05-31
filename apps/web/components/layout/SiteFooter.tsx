import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Legal links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms-and-conditions" className="text-xs text-slate-500 hover:text-slate-900">
              Terms and conditions
            </Link>
            <Link href="/cookie-policy" className="text-xs text-slate-500 hover:text-slate-900">
              Cookie policy
            </Link>
            <Link href="/privacy-policy" className="text-xs text-slate-500 hover:text-slate-900">
              Privacy policy
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            Copyright &copy; QuicklisterPro {new Date().getFullYear()}
          </p>

          {/* Partner logos */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-600">Property Redress</span>
            <div className="flex items-center gap-1" aria-label="Payments by Stripe">
              <span className="text-xs text-slate-400">Secure payments by</span>
              <span className="text-xs font-bold text-slate-700">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
