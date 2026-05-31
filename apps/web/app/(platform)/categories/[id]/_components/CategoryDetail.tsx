'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  useCategory,
  useCategories,
  useUpdateCategory,
  useDeleteCategory,
} from '../../_hooks/useCategories';
import { CategoryForm } from '../../_components/CategoryForm';
import type { UpdateCategory } from '@/lib/schemas/category.schemas';

interface CategoryDetailProps {
  id: string;
}

// ── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone({ id }: { id: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const deleteCategory = useDeleteCategory();

  const apiErrorMessage =
    deleteCategory.error instanceof ApiError ? deleteCategory.error.message : null;
  const serverError =
    deleteCategory.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-slate-800">Danger zone</h2>
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h3 className="text-base font-semibold text-red-700">Delete category</h3>
        <p className="mt-1.5 max-w-prose text-sm text-slate-600">
          Deleting a category is permanent. Categories with subcategories cannot be deleted — remove
          or re-parent them first.
        </p>

        <div className="mt-4 flex items-start gap-3">
          <input
            id={`confirm-delete-${id}`}
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor={`confirm-delete-${id}`} className="cursor-pointer text-sm text-slate-700">
            I understand this action is permanent and cannot be reversed.
          </label>
        </div>

        {serverError !== null && (
          <p className="mt-3 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="button"
          disabled={!confirmed || deleteCategory.isPending}
          onClick={() => void deleteCategory.mutateAsync(id)}
          className={cn(
            'mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
            !confirmed || deleteCategory.isPending
              ? 'cursor-not-allowed bg-red-300'
              : 'bg-red-600 hover:bg-red-700',
          )}
        >
          {deleteCategory.isPending ? 'Deleting…' : 'Delete category'}
        </button>
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CategoryDetail({ id }: CategoryDetailProps) {
  const { data: category, isLoading, error } = useCategory(id);
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateCategory(id);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roleName === 'admin';

  // Parent category name for breadcrumb
  const parentCategory = category?.parentId
    ? categories.find((c) => c.id === category.parentId)
    : null;

  // Subcategories of this category
  const children = categories.filter((c) => c.parentId === id);

  async function handleUpdate(data: UpdateCategory) {
    await updateCategory.mutateAsync(data);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
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

        <div className="flex items-start justify-between gap-3">
          <div>
            {parentCategory && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                <Link href={`/categories/${parentCategory.id}`} className="hover:text-blue-600">
                  {parentCategory.name}
                </Link>
                {' '}›
              </p>
            )}
            <h1 className="text-2xl font-bold text-slate-900">
              {category ? category.name : 'Category'}
            </h1>
            {category && (
              <p className="mt-0.5 font-mono text-sm text-slate-400">/{category.slug}</p>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-lg bg-slate-200" />
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      )}

      {error !== null && !isLoading && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-sm font-medium text-red-700">Failed to load category.</p>
          <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
        </div>
      )}

      {category !== undefined && (
        <div className="space-y-8">
          {/* Edit form (admin) or read-only view */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-slate-800">Category details</h2>

            {isAdmin ? (
              <CategoryForm
                mode="edit"
                category={category}
                categories={categories}
                onSubmit={handleUpdate}
                isPending={updateCategory.isPending}
                error={updateCategory.error}
              />
            ) : (
              <dl className="space-y-4 text-sm">
                {category.description && (
                  <div>
                    <dt className="font-medium text-slate-500">Description</dt>
                    <dd className="mt-0.5 text-slate-900">{category.description}</dd>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-500">Slug</dt>
                    <dd className="mt-0.5 font-mono text-slate-900">{category.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Sort order</dt>
                    <dd className="mt-0.5 text-slate-900">{category.sortOrder}</dd>
                  </div>
                </div>
              </dl>
            )}
          </section>

          {/* Subcategories */}
          {children.length > 0 && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-800">Subcategories</h2>
              <ul className="space-y-2">
                {children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.id}`}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{child.name}</span>
                      <span className="font-mono text-slate-400">/{child.slug}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Admin: add subcategory shortcut */}
          {isAdmin && (
            <div className="text-right">
              <Link
                href={`/categories/new?parentId=${category.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add subcategory
              </Link>
            </div>
          )}

          {/* Admin: danger zone */}
          {isAdmin && <DangerZone id={id} />}
        </div>
      )}
    </div>
  );
}
