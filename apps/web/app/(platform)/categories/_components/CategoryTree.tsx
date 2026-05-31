'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCategoryTree } from '../_hooks/useCategories';
import type { CategoryTreeNode } from '@/lib/api/categories.api';

// ── Recursive tree node ───────────────────────────────────────────────────────

function TreeNode({ node, depth = 0 }: { node: CategoryTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50',
          depth === 0 && 'font-medium text-slate-800',
          depth > 0 && 'text-slate-700',
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:text-slate-600"
          >
            <svg className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <Link
          href={`/categories/${node.id}`}
          className="flex-1 truncate text-sm hover:text-blue-600"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {node.children.length}
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── Exported tree component ───────────────────────────────────────────────────

export function CategoryTree() {
  const { data: tree, isLoading, error } = useCategoryTree();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} className="h-9 rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error ?? !tree) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Failed to load category tree.
      </p>
    );
  }

  if (tree.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">No categories yet.</p>
    );
  }

  return (
    <nav aria-label="Category tree">
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </ul>
    </nav>
  );
}
