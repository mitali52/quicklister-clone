import type { Metadata } from 'next';
import { AuthPageShell } from '../_components/AuthPageShell';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthPageShell>{children}</AuthPageShell>
  );
}
