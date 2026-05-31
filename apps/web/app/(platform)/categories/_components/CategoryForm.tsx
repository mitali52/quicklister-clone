'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import {
  CreateCategorySchema,
  type CreateCategory,
  type UpdateCategory,
} from '@/lib/schemas/category.schemas';
import type { Category } from '@/lib/api/categories.api';

// ── Shared field sub-components ───────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

// ── Discriminated union for polymorphic mode ──────────────────────────────────

type CreateMode = {
  mode: 'create';
  categories: Category[];
  onSubmit: (data: CreateCategory) => Promise<void>;
  isPending: boolean;
  error: unknown;
};

type EditMode = {
  mode: 'edit';
  category: Category;
  categories: Category[];
  onSubmit: (data: UpdateCategory) => Promise<void>;
  isPending: boolean;
  error: unknown;
};

type CategoryFormProps = CreateMode | EditMode;

// ── Form component ────────────────────────────────────────────────────────────

export function CategoryForm(props: CategoryFormProps) {
  const isEdit = props.mode === 'edit';
  const category = isEdit ? props.category : undefined;

  const form = useForm<CreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      parentId: category?.parentId ?? undefined,
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      sortOrder: category?.sortOrder ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = form;

  // Auto-generate slug from name in create mode
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEdit && nameValue) {
      const generated = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setValue('slug', generated, { shouldValidate: false });
    }
  }, [isEdit, nameValue, setValue]);

  // Reset form when category changes in edit mode
  useEffect(() => {
    if (category) {
      reset({
        parentId: category.parentId ?? undefined,
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        sortOrder: category.sortOrder,
      });
    }
  }, [category?.updatedAt, reset, category]);

  async function onSubmit(data: CreateCategory) {
    await props.onSubmit(data as never);
  }

  const apiErrorMessage =
    props.error instanceof ApiError ? props.error.message : null;
  const serverError =
    props.error !== null && props.error !== undefined && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  // Parent category options — exclude self and descendants (basic: exclude self)
  const parentOptions = props.categories.filter((c) => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Parent category */}
      <Field label="Parent category" error={errors.parentId?.message}>
        <select
          {...register('parentId')}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2',
            errors.parentId
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-blue-500',
          )}
        >
          <option value="">— None (root category) —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Name */}
      <Field label="Name" error={errors.name?.message}>
        <input
          type="text"
          placeholder="e.g. Residential Sales"
          {...register('name')}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2',
            errors.name
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-blue-500',
          )}
        />
      </Field>

      {/* Slug */}
      <Field label="Slug" error={errors.slug?.message}>
        <input
          type="text"
          placeholder="e.g. residential-sales"
          {...register('slug')}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 font-mono text-sm shadow-sm focus:outline-none focus:ring-2',
            errors.slug
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-blue-500',
          )}
        />
        <p className="mt-1 text-xs text-slate-500">
          URL-safe identifier: lowercase letters, numbers and hyphens only.
        </p>
      </Field>

      {/* Description */}
      <Field label="Description (optional)" error={errors.description?.message}>
        <textarea
          rows={3}
          placeholder="Brief description of this category…"
          {...register('description')}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2',
            errors.description
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-blue-500',
          )}
        />
      </Field>

      {/* Sort order */}
      <Field label="Sort order" error={errors.sortOrder?.message}>
        <input
          type="number"
          min={0}
          step={1}
          {...register('sortOrder', { valueAsNumber: true })}
          className={cn(
            'w-32 rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2',
            errors.sortOrder
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-blue-500',
          )}
        />
        <p className="mt-1 text-xs text-slate-500">
          Lower numbers appear first within the parent.
        </p>
      </Field>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={props.isPending || (isEdit && !isDirty)}
        className={cn(
          'rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
          props.isPending || (isEdit && !isDirty)
            ? 'cursor-not-allowed bg-blue-400'
            : 'bg-blue-600 hover:bg-blue-700',
        )}
      >
        {props.isPending
          ? isEdit
            ? 'Saving…'
            : 'Creating…'
          : isEdit
          ? 'Save changes'
          : 'Create category'}
      </button>
    </form>
  );
}
