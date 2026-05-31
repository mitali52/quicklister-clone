import type { Metadata } from 'next';
import { OrganizationDetail } from './_components/OrganizationDetail';

export const metadata: Metadata = {
  title: 'Organization | Quicklister',
};

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;
  return <OrganizationDetail id={id} />;
}
