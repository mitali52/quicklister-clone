import type { Metadata } from 'next';
import { ListingDetail } from './_components/ListingDetail';

export const metadata: Metadata = {
  title: 'Listing | Quicklister',
};

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  return <ListingDetail id={id} />;
}
