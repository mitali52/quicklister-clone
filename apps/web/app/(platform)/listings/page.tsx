import type { Metadata } from 'next';
import { ListingsPageContent } from './_components/ListingsPageContent';

export const metadata: Metadata = {
  title: 'My Listings | Quicklister',
};

export default function ListingsPage() {
  return <ListingsPageContent />;
}
