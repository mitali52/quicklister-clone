import type { Metadata } from 'next';
import { AdminUserDetailContent } from './_components/AdminUserDetailContent';

export const metadata: Metadata = {
  title: 'User | Admin | Quicklister',
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetailContent id={id} />;
}
