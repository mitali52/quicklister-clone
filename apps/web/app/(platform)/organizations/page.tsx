import type { Metadata } from 'next';
import { OrganizationsList } from './_components/OrganizationsList';

export const metadata: Metadata = {
  title: 'Organizations | Quicklister',
};

export default function OrganizationsPage() {
  return <OrganizationsList />;
}
