import type { Metadata } from 'next';
import { ChangePasswordForm } from './_components/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Change Password | Quicklister',
};

export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
