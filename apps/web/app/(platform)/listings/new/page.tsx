import type { Metadata } from 'next';
import { CreateListingContent } from './_components/CreateListingContent';

export const metadata: Metadata = {
  title: 'Create Listing | Quicklister',
};

export default function NewListingPage() {
  return <CreateListingContent />;
}
