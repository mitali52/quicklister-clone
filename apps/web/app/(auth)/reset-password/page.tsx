import type { Metadata } from 'next';
import { ResetPasswordForm } from './_components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage({
  searchParams,
}: Readonly<{ searchParams?: { token?: string } }>) {
  const token = searchParams?.token ?? '';

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your new password to complete the reset.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </>
  );
}
