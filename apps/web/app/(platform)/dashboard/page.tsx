import type { Metadata } from 'next';
import { DashboardContent } from './_components/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your property listings, messages, and account activity in Quicklister.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
