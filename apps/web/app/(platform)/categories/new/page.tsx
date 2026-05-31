import type { Metadata } from 'next';
import { CreateCategoryContent } from './_components/CreateCategoryContent';

export const metadata: Metadata = {
  title: 'New Category | Quicklister',
};

export default function NewCategoryPage() {
  return <CreateCategoryContent />;
}
