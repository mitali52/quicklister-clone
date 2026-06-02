import type { Metadata } from 'next';
import { AdminListingsContent } from './_components/AdminListingsContent';

export const metadata: Metadata = {
  title: 'Listings | Admin | Quicklister',
};

export default function AdminListingsPage() {
  return <AdminListingsContent />;
}
