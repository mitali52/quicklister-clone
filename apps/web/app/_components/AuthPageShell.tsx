import Link from 'next/link';

interface AuthPageShellProps {
  children: React.ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-blue-700 hover:text-blue-800"
          >
            Quicklister
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
