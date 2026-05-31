import { AuthPageShell } from '../_components/AuthPageShell';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthPageShell>{children}</AuthPageShell>
  );
}
