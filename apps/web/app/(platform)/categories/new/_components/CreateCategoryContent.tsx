'use client';

import Link from 'next/link';
import { useCategories, useCreateCategory } from '../../_hooks/useCategories';
import { CategoryForm } from '../../_components/CategoryForm';
import type { CreateCategory } from '@/lib/schemas/category.schemas';

export function CreateCategoryContent() {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();

  async function handleSubmit(data: CreateCategory) {
    await createCategory.mutateAsync(data);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/categories"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to categories
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New category</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a root or subcategory for property listings.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <CategoryForm
          mode="create"
          categories={categories}
          onSubmit={handleSubmit}
          isPending={createCategory.isPending}
          error={createCategory.error}
        />
      </section>
    </div>
  );
}
