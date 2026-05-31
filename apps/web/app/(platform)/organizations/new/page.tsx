import type { Metadata } from 'next';
import { CreateOrganizationContent } from './_components/CreateOrganizationContent';

export const metadata: Metadata = {
  title: 'Create Organization | Quicklister',
};

export default function NewOrganizationPage() {
  return <CreateOrganizationContent />;
}
