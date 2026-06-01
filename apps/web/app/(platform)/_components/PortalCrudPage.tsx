'use client';

import { useEffect, useMemo, useState } from 'react';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import {
  createPortalRecordApi,
  deletePortalRecordApi,
  listPortalRecordsApi,
  updatePortalRecordApi,
  type PortalRecord,
  type PortalRecordInput,
  type PortalRecordType,
} from '@/lib/api/portal-records.api';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/FormField';

export type PortalFieldType = 'text' | 'number' | 'date' | 'textarea' | 'select';

export interface PortalFieldConfig {
  name: string;
  label: string;
  type: PortalFieldType;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface PortalColumnConfig {
  label: string;
  source?: 'title' | 'status' | 'amount' | 'createdAt' | 'updatedAt' | 'payload';
  payloadKey?: string;
  format?: 'text' | 'currency' | 'date';
  truncate?: number;
  signed?: boolean;
  fallback?: string;
  className?: string;
}

export interface PortalCrudPageProps {
  recordType: PortalRecordType;
  title: string;
  subtitle: string;
  createLabel: string;
  fields: PortalFieldConfig[];
  columns: PortalColumnConfig[];
  emptyTitle: string;
  emptyCopy: string;
  tip?: React.ReactNode;
  summaryType?: 'wallet' | 'valuation';
}

type FormValues = Record<string, string>;

function blankValues(fields: PortalFieldConfig[]): FormValues {
  return Object.fromEntries(fields.map((field) => [field.name, ''])) as FormValues;
}

function valuesFromRecord(fields: PortalFieldConfig[], record: PortalRecord): FormValues {
  const base: FormValues = blankValues(fields);
  for (const field of fields) {
    if (field.name === 'title') {
      base[field.name] = record.title;
      continue;
    }
    if (field.name === 'status') {
      base[field.name] = record.status;
      continue;
    }
    if (field.name === 'amount') {
      base[field.name] = record.amount === null ? '' : String(record.amount);
      continue;
    }
    if (field.name === 'currency') {
      base[field.name] = record.currency;
      continue;
    }

    const value = record.payload[field.name];
    base[field.name] = value === undefined || value === null ? '' : String(value);
  }
  return base;
}

function readPayload(
  values: FormValues,
  fields: PortalFieldConfig[],
  recordType: PortalRecordType,
): PortalRecordInput {
  const payload: Record<string, unknown> = {};
  let title = values.title?.trim() ?? '';

  if (!title) {
    title = 'Untitled record';
  }

  for (const field of fields) {
    const raw = values[field.name] ?? '';
    if (field.name === 'title' || field.name === 'status' || field.name === 'amount' || field.name === 'currency') {
      continue;
    }
    payload[field.name] = raw;
  }

  const amountRaw = values.amount?.trim();
  const amount = amountRaw ? Number(amountRaw) : null;

  return {
    recordType,
    title,
    status: values.status?.trim() || undefined,
    amount: amount !== null && Number.isFinite(amount) ? amount : undefined,
    currency: values.currency?.trim() || undefined,
    payload,
  };
}

function renderColumnValue(record: PortalRecord, column: PortalColumnConfig): React.ReactNode {
  let value: unknown;

  switch (column.source ?? 'payload') {
    case 'title':
      value = record.title;
      break;
    case 'status':
      value = record.status;
      break;
    case 'amount':
      value = column.signed && record.status === 'debit' ? -(record.amount ?? 0) : record.amount;
      break;
    case 'createdAt':
      value = record.createdAt;
      break;
    case 'updatedAt':
      value = record.updatedAt;
      break;
    default:
      value = column.payloadKey ? record.payload[column.payloadKey] : record.payload;
      break;
  }

  if (value === undefined || value === null || value === '') {
    return column.fallback ?? '—';
  }

  if (column.format === 'currency') {
    const amount = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(amount)) return column.fallback ?? '—';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (column.format === 'date') {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const text = String(value);
  if (column.truncate && text.length > column.truncate) {
    return `${text.slice(0, column.truncate)}…`;
  }

  return text;
}

function FieldRenderer({
  field,
  register,
  error,
}: {
  field: PortalFieldConfig;
  register: UseFormRegister<FormValues>;
  error?: string;
}) {
  const id = field.name;

  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <textarea
          id={id}
          rows={4}
          placeholder={field.placeholder}
          className={cn(
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
            'outline-none transition-colors resize-none',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
          )}
          {...register(field.name)}
        />
        {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <select
          id={id}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900',
            'outline-none transition-colors',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200',
          )}
          {...register(field.name)}
        >
          <option value="">{field.placeholder ?? `Select ${field.label.toLowerCase()}`}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <FormField
      label={field.label}
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      placeholder={field.placeholder}
      error={error}
      {...register(field.name)}
    />
  );
}

function RecordTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-px bg-slate-200" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-12 bg-slate-100" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, row) => (
        <div
          key={row}
          className="grid gap-px border-t border-slate-100"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, index) => (
            <div key={index} className="h-16 bg-white px-4 py-3">
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PortalCrudPage({
  recordType,
  title,
  subtitle,
  createLabel,
  fields,
  columns,
  emptyTitle,
  emptyCopy,
  tip,
  summaryType,
}: PortalCrudPageProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PortalRecord | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: useMemo(() => blankValues(fields), [fields]),
  });

  const query = useQuery({
    queryKey: ['portal-records', recordType],
    queryFn: () => listPortalRecordsApi(recordType),
  });

  const createMutation = useMutation({
    mutationFn: createPortalRecordApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-records', recordType] });
      setEditing(null);
      reset(blankValues(fields));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PortalRecordInput }) =>
      updatePortalRecordApi(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-records', recordType] });
      setEditing(null);
      reset(blankValues(fields));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortalRecordApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-records', recordType] });
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        ...valuesFromRecord(fields, editing),
      });
    } else {
      reset(blankValues(fields));
    }
  }, [editing, fields, recordType, reset]);

  async function onSubmit(values: FormValues) {
    const data = readPayload(values, fields, recordType);
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data });
      return;
    }
    await createMutation.mutateAsync(data);
  }

  const records = query.data ?? [];
  const summaryContent =
    summaryType === 'wallet' ? (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Current Credit Balance
        </p>
        <p className="mt-3 text-4xl font-black">
          {new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
          }).format(
            records.reduce((total, record) => {
              const value = record.amount ?? 0;
              return total + (record.status === 'debit' ? -value : value);
            }, 0),
          )}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Add credit to your wallet balance so you can purchase listings or products without a credit card.
        </p>
      </div>
    ) : summaryType === 'valuation' ? (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Latest Valuation
        </p>
        <p className="mt-3 text-3xl font-black">
          {new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
          }).format(records[0]?.amount ?? 0)}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {records[0]
            ? `Requested on ${new Date(records[0].createdAt).toLocaleDateString('en-GB')}`
            : 'Submit a request to generate an estimate.'}
        </p>
      </div>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-7 text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center justify-center rounded-full bg-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500"
        >
          {createLabel}
        </button>
      </div>

      {tip && <div className="mb-6">{tip}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editing ? `Edit ${title}` : `Create ${title}`}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editing ? 'Update the selected record and save your changes.' : 'Add a new record to keep this section up to date.'}
                </p>
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    reset(blankValues(fields));
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              {fields.map((field, index) => (
                <div
                  key={field.name}
                  className={cn(
                    field.type === 'textarea' ? 'sm:col-span-2' : '',
                    index === 0 ? 'sm:col-span-2' : '',
                  )}
                >
                  <FieldRenderer
                    field={field}
                    register={register}
                    error={errors[field.name]?.message as string | undefined}
                  />
                </div>
              ))}

              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || createMutation.isPending || updateMutation.isPending
                    ? 'Saving…'
                    : editing
                      ? 'Save changes'
                      : createLabel}
                </button>
                {(createMutation.error || updateMutation.error) && (
                  <p className="text-sm text-rose-600">
                    {(createMutation.error ?? updateMutation.error) instanceof ApiError
                      ? (createMutation.error ?? updateMutation.error)?.message
                      : 'Something went wrong. Please try again.'}
                  </p>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Saved records</h2>
                <p className="mt-1 text-sm text-slate-500">{records.length} total records</p>
              </div>
            </div>

            {query.isLoading ? (
              <div className="p-6">
                <RecordTableSkeleton columns={columns.length + 1} />
              </div>
            ) : query.error ? (
              <div className="px-6 py-10 text-sm text-rose-600">
                Failed to load records. Please refresh the page.
              </div>
            ) : records.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-base font-semibold text-slate-900">{emptyTitle}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{emptyCopy}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.label}
                          className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider', column.className)}
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        {columns.map((column) => (
                          <td key={column.label} className={cn('px-4 py-4 align-top text-sm text-slate-700', column.className)}>
                            {renderColumnValue(record, column)}
                          </td>
                        ))}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditing(record)}
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteMutation.mutateAsync(record.id)}
                              className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {summaryContent ? (
            <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              {summaryContent}
            </section>
          ) : null}
          <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">
              Quick tip
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use the actions column to update or remove records. Each menu area persists to PostgreSQL so the dashboard stays consistent across refreshes.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
