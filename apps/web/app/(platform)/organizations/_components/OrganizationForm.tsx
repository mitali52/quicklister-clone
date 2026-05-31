'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/components/ui/FormField';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  type CreateOrganization,
  type UpdateOrganization,
} from '@/lib/schemas/organization.schemas';
import type { Organization } from '@/lib/api/organizations.api';

type CreateMode = {
  mode: 'create';
  onSubmit: (data: CreateOrganization) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

type EditMode = {
  mode: 'edit';
  organization: Organization;
  onSubmit: (data: UpdateOrganization) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

type OrganizationFormProps = CreateMode | EditMode;

function TextAreaField({
  label,
  error,
  rows = 3,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; rows?: number }) {
  const id = (props.id ?? label.toLowerCase().replace(/\s+/g, '-'));
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={cn(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'outline-none transition-colors resize-none',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
        )}
        aria-invalid={error !== undefined}
        {...props}
      />
      {error !== undefined && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </div>
  );
}

export function OrganizationForm(props: OrganizationFormProps) {
  const isEdit = props.mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateOrganization | UpdateOrganization>({
    resolver: zodResolver(isEdit ? UpdateOrganizationSchema : CreateOrganizationSchema),
    defaultValues: isEdit
      ? {
          name: props.organization.name,
          slug: props.organization.slug,
          description: props.organization.description ?? '',
          logoUrl: props.organization.logoUrl ?? '',
          websiteUrl: props.organization.websiteUrl ?? '',
        }
      : {},
  });

  useEffect(() => {
    if (isEdit) {
      reset({
        name: props.organization.name,
        slug: props.organization.slug,
        description: props.organization.description ?? '',
        logoUrl: props.organization.logoUrl ?? '',
        websiteUrl: props.organization.websiteUrl ?? '',
      });
    }
    // Intentionally runs only when org data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit ? props.organization.updatedAt : null]);

  async function onSubmit(data: CreateOrganization | UpdateOrganization) {
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
    );
    await props.onSubmit(sanitized as CreateOrganization & UpdateOrganization);
  }

  const apiError =
    props.error instanceof ApiError ? props.error.message : props.error !== null ? 'Something went wrong. Please try again.' : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="Name"
        placeholder="Acme Lettings"
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <FormField
          label="Slug"
          placeholder="acme-lettings"
          error={errors.slug?.message}
          {...register('slug')}
        />
        <p className="mt-1 text-xs text-slate-400">
          Lowercase letters, numbers, and hyphens only. Must be unique.
        </p>
      </div>

      <TextAreaField
        label="Description"
        placeholder="A short description of your organization…"
        error={errors.description?.message}
        {...register('description')}
      />

      <FormField
        label="Logo URL"
        type="url"
        placeholder="https://example.com/logo.png"
        error={errors.logoUrl?.message}
        {...register('logoUrl')}
      />

      <FormField
        label="Website URL"
        type="url"
        placeholder="https://example.com"
        error={errors.websiteUrl?.message}
        {...register('websiteUrl')}
      />

      {apiError !== null && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || props.isPending || (isEdit && !isDirty)}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
            isSubmitting || props.isPending || (isEdit && !isDirty)
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-800',
          )}
        >
          {isSubmitting || props.isPending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Create organization'}
        </button>
      </div>
    </form>
  );
}
