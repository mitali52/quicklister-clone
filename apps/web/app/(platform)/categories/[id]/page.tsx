import type { Metadata } from 'next';
import { CategoryDetail } from './_components/CategoryDetail';

export const metadata: Metadata = {
  title: 'Category | Quicklister',
};

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  return <CategoryDetail id={id} />;
}
