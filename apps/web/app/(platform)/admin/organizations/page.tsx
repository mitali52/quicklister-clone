import type { Metadata } from 'next';
import { AdminOrganizationsContent } from './_components/AdminOrganizationsContent';

export const metadata: Metadata = {
  title: 'Organizations | Admin | Quicklister',
};

export default function AdminOrganizationsPage() {
  return <AdminOrganizationsContent />;
}
