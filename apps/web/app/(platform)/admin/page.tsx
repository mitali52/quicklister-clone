import type { Metadata } from 'next';
import { AdminDashboardContent } from './_components/AdminDashboardContent';

export const metadata: Metadata = {
  title: 'Admin | Quicklister',
};

export default function AdminPage() {
  return <AdminDashboardContent />;
}
