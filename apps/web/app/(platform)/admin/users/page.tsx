import type { Metadata } from 'next';
import { AdminUsersContent } from './_components/AdminUsersContent';

export const metadata: Metadata = {
  title: 'Users | Admin | Quicklister',
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
