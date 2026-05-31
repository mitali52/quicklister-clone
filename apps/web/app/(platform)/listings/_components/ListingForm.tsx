'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/components/ui/FormField';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import {
  CreateListingSchema,
  UpdateListingSchema,
  type CreateListing,
  type UpdateListing,
} from '@/lib/schemas/listing.schemas';
import type { Listing } from '@/lib/api/listings.api';

// ── Select field ─────────────────────────────────────────────────────────────

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function SelectField({ label, error, children, ...props }: SelectFieldProps) {
  const id = props.id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        className={cn(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 bg-white',
          'outline-none transition-colors',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
        )}
        aria-invalid={error !== undefined}
        {...props}
      >
        {children}
      </select>
      {error !== undefined && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}
    </div>
  );
}

// ── Number field ──────────────────────────────────────────────────────────────

interface NumberFieldProps {
  label: string;
  description?: string;
  error?: string;
  value?: number;
  onChange: (val: number | undefined) => void;
  min?: number;
  placeholder?: string;
}

function NumberField({ label, description, error, value, onChange, min = 0, placeholder }: NumberFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : Number(v));
        }}
        className={cn(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'outline-none transition-colors',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
        )}
        aria-invalid={error !== undefined}
      />
      {description && <p className="text-xs text-slate-400">{description}</p>}
      {error !== undefined && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
}

// ── Textarea field ────────────────────────────────────────────────────────────

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

function TextAreaField({ label, error, ...props }: TextAreaFieldProps) {
  const id = props.id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        id={id}
        rows={4}
        className={cn(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'outline-none transition-colors resize-none',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
        )}
        aria-invalid={error !== undefined}
        {...props}
      />
      {error !== undefined && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
}

// ── Form modes ────────────────────────────────────────────────────────────────

type CreateMode = {
  mode: 'create';
  onSubmit: (data: CreateListing) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

type EditMode = {
  mode: 'edit';
  listing: Listing;
  onSubmit: (data: UpdateListing) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

type ListingFormProps = CreateMode | EditMode;

// ── Form component ────────────────────────────────────────────────────────────

export function ListingForm(props: ListingFormProps) {
  const isEdit = props.mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateListing | UpdateListing>({
    resolver: zodResolver(isEdit ? UpdateListingSchema : CreateListingSchema),
    defaultValues: isEdit
      ? {
          title: props.listing.title,
          description: props.listing.description ?? '',
          listingType: props.listing.listingType,
          propertyType: props.listing.propertyType,
          askingPrice: props.listing.askingPrice ?? undefined,
          monthlyRent: props.listing.monthlyRent ?? undefined,
          addressLine1: props.listing.addressLine1,
          addressLine2: props.listing.addressLine2 ?? '',
          city: props.listing.city,
          postcode: props.listing.postcode,
          bedrooms: props.listing.bedrooms ?? undefined,
          bathrooms: props.listing.bathrooms ?? undefined,
        }
      : {},
  });

  useEffect(() => {
    if (isEdit) {
      reset({
        title: props.listing.title,
        description: props.listing.description ?? '',
        listingType: props.listing.listingType,
        propertyType: props.listing.propertyType,
        askingPrice: props.listing.askingPrice ?? undefined,
        monthlyRent: props.listing.monthlyRent ?? undefined,
        addressLine1: props.listing.addressLine1,
        addressLine2: props.listing.addressLine2 ?? '',
        city: props.listing.city,
        postcode: props.listing.postcode,
        bedrooms: props.listing.bedrooms ?? undefined,
        bathrooms: props.listing.bathrooms ?? undefined,
      });
    }
    // Intentionally depends only on updatedAt to re-sync after server updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit ? props.listing.updatedAt : null]);

  const askingPrice = watch('askingPrice');
  const monthlyRent = watch('monthlyRent');
  const bedrooms = watch('bedrooms');
  const bathrooms = watch('bathrooms');

  async function onSubmit(data: CreateListing | UpdateListing) {
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
    );
    await props.onSubmit(sanitized as CreateListing & UpdateListing);
  }

  const apiError =
    props.error instanceof ApiError
      ? props.error.message
      : props.error !== null
        ? 'Something went wrong. Please try again.'
        : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Title */}
      <FormField
        label="Title"
        placeholder="Bright 2-bed flat in Islington"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Description */}
      <TextAreaField
        label="Description"
        placeholder="Describe the property…"
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Type selects */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Listing type"
          error={errors.listingType?.message}
          {...register('listingType')}
        >
          <option value="">Select listing type…</option>
          <option value="residential_let">Residential Let</option>
          <option value="residential_sale">Residential Sale</option>
          <option value="commercial_let">Commercial Let</option>
          <option value="commercial_sale">Commercial Sale</option>
        </SelectField>

        <SelectField
          label="Property type"
          error={errors.propertyType?.message}
          {...register('propertyType')}
        >
          <option value="">Select property type…</option>
          <option value="flat">Flat</option>
          <option value="detached">Detached</option>
          <option value="semi_detached">Semi-detached</option>
          <option value="terraced">Terraced</option>
          <option value="bungalow">Bungalow</option>
          <option value="maisonette">Maisonette</option>
          <option value="studio">Studio</option>
          <option value="other">Other</option>
        </SelectField>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Monthly rent (pence)"
          description="e.g. 200000 = £2,000 pcm"
          placeholder="200000"
          error={errors.monthlyRent?.message}
          value={monthlyRent}
          onChange={(v) => setValue('monthlyRent', v, { shouldDirty: true })}
          min={1}
        />
        <NumberField
          label="Asking price (pence)"
          description="e.g. 45000000 = £450,000"
          placeholder="45000000"
          error={errors.askingPrice?.message}
          value={askingPrice}
          onChange={(v) => setValue('askingPrice', v, { shouldDirty: true })}
          min={1}
        />
      </div>

      {/* Address */}
      <div className="space-y-4">
        <FormField
          label="Address line 1"
          placeholder="12 Baker Street"
          error={errors.addressLine1?.message}
          {...register('addressLine1')}
        />
        <FormField
          label="Address line 2"
          placeholder="Flat 2 (optional)"
          error={errors.addressLine2?.message}
          {...register('addressLine2')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="City"
            placeholder="London"
            error={errors.city?.message}
            {...register('city')}
          />
          <FormField
            label="Postcode"
            placeholder="NW1 6XE"
            error={errors.postcode?.message}
            {...register('postcode')}
          />
        </div>
      </div>

      {/* Rooms */}
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Bedrooms"
          placeholder="2"
          error={errors.bedrooms?.message}
          value={bedrooms}
          onChange={(v) => setValue('bedrooms', v, { shouldDirty: true })}
          min={0}
        />
        <NumberField
          label="Bathrooms"
          placeholder="1"
          error={errors.bathrooms?.message}
          value={bathrooms}
          onChange={(v) => setValue('bathrooms', v, { shouldDirty: true })}
          min={0}
        />
      </div>

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
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-blue-700 hover:bg-blue-800',
          )}
        >
          {isSubmitting || props.isPending
            ? isEdit ? 'Saving…' : 'Creating…'
            : isEdit ? 'Save changes' : 'Create listing'}
        </button>
      </div>
    </form>
  );
}
