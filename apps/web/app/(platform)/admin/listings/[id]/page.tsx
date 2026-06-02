import type { Metadata } from 'next';
import { AdminListingDetailContent } from './_components/AdminListingDetailContent';

export const metadata: Metadata = {
  title: 'Listing | Admin | Quicklister',
};

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminListingDetailContent id={id} />;
}
