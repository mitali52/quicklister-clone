import type { Metadata } from 'next';
import { AuthGuard } from './_components/AuthGuard';
import { PlatformShell } from './_components/PlatformShell';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <PlatformShell>{children}</PlatformShell>
    </AuthGuard>
  );
}
