'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCategories } from './_hooks/useCategories';
import { CategoryCard } from './_components/CategoryCard';
import { CategoryTree } from './_components/CategoryTree';

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roleName === 'admin';

  const rootCategories = categories?.filter((c) => c.parentId === null) ?? [];
  const childCountMap = new Map<string, number>();
  for (const cat of categories ?? []) {
    if (cat.parentId) {
      childCountMap.set(cat.parentId, (childCountMap.get(cat.parentId) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Property listing categories and subcategories.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/categories/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New category
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left: tree navigation */}
        <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:h-fit">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Category tree
          </h2>
          <CategoryTree />
        </aside>

        {/* Right: root category cards */}
        <main>
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((k) => (
                <div key={k} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          )}

          {error !== null && !isLoading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
              <p className="text-sm font-medium text-red-700">Failed to load categories.</p>
              <p className="mt-1 text-sm text-red-500">Please refresh the page to try again.</p>
            </div>
          )}

          {!isLoading && !error && rootCategories.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-slate-500">No categories have been created yet.</p>
              {isAdmin && (
                <Link
                  href="/categories/new"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create first category
                </Link>
              )}
            </div>
          )}

          {rootCategories.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {rootCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  childCount={childCountMap.get(cat.id) ?? 0}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
