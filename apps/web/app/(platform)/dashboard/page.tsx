import type { Metadata } from 'next';
import { DashboardContent } from './_components/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | Quicklister',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
