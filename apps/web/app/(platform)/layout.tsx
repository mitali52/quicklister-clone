import { AuthGuard } from './_components/AuthGuard';
import { PlatformTopBar } from './_components/PlatformTopBar';

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <PlatformTopBar />
        <div className="flex flex-1">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
