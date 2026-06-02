import type { Metadata } from 'next';
import { AdminOrganizationDetailContent } from './_components/AdminOrganizationDetailContent';

export const metadata: Metadata = {
  title: 'Organization | Admin | Quicklister',
};

export default async function AdminOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrganizationDetailContent id={id} />;
}
