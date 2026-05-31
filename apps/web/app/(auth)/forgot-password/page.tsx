import type { Metadata } from 'next';
import { ForgotPasswordForm } from './_components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}
