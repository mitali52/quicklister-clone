import Link from 'next/link';
import type { Category } from '@/lib/api/categories.api';

interface CategoryCardProps {
  category: Category;
  childCount?: number;
}

export function CategoryCard({ category, childCount = 0 }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{category.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate-400">/{category.slug}</p>
        </div>
        {childCount > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {childCount} {childCount === 1 ? 'subcategory' : 'subcategories'}
          </span>
        )}
      </div>
      {category.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{category.description}</p>
      )}
    </Link>
  );
}
