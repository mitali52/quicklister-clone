'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPortalRecordApi,
  deletePortalRecordApi,
  listPortalRecordsApi,
  type PortalRecord,
} from '@/lib/api/portal-records.api';
import { formatCurrency } from '@/lib/portal-records.helpers';
import { cn } from '@/lib/utils';

type AddOnTab = 'individual' | 'media';

export interface AddOnProduct {
  key: string;
  name: string;
  description: string;
  price: number;
  tab: AddOnTab;
  accent?: string;
  badge?: string;
}

export interface AddOnsPageProps {
  title: string;
  subtitle: string;
  pageKey: 'sales' | 'lettings';
  products: AddOnProduct[];
  faqs: string[];
  heroTone?: 'blue' | 'purple';
}

function AddOnCard({
  product,
  onAdd,
}: {
  product: AddOnProduct;
  onAdd: (product: AddOnProduct) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={cn('relative h-44 bg-gradient-to-br', product.accent ?? 'from-slate-100 to-slate-300')}>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          More info
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-sm font-bold text-slate-900">{product.name}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">From {formatCurrency(product.price)}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {product.badge && (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            {product.badge}
          </span>
        )}
        <p className="text-sm leading-6 text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-bold text-slate-900">{formatCurrency(product.price)}</p>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="rounded-full bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-fuchsia-500"
          >
            Add to plan
          </button>
        </div>
      </div>
    </article>
  );
}

function FaqItem({ question }: { question: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-colors hover:bg-slate-50"
    >
      <span className="text-sm font-semibold text-slate-800">{question}</span>
      <span className="text-2xl font-light text-cyan-500">+</span>
    </button>
  );
}

export function AddOnsPage({ title, subtitle, pageKey, products, faqs, heroTone = 'blue' }: AddOnsPageProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AddOnTab>('individual');
  const { data: selected = [], isLoading } = useQuery({
    queryKey: ['portal-records', 'addon_orders', pageKey],
    queryFn: () => listPortalRecordsApi('addon_orders'),
    select: (records) =>
      records.filter((record) => (record.payload as { pageKey?: string }).pageKey === pageKey),
  });

  const createMutation = useMutation({
    mutationFn: createPortalRecordApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-records', 'addon_orders', pageKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortalRecordApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-records', 'addon_orders', pageKey] });
    },
  });

  const visibleProducts = useMemo(
    () => products.filter((product) => product.tab === tab),
    [products, tab],
  );

  const total = selected.reduce((sum, record) => sum + (record.amount ?? 0), 0);

  async function handleAdd(product: AddOnProduct) {
    await createMutation.mutateAsync({
      recordType: 'addon_orders',
      title: product.name,
      amount: product.price,
      status: 'selected',
      currency: 'GBP',
      payload: {
        pageKey,
        productKey: product.key,
        tab: product.tab,
      },
    });
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-64 -skew-x-12 bg-gradient-to-b from-fuchsia-600 via-indigo-500 to-cyan-400 opacity-90 lg:block" />
      <div className="absolute inset-y-0 right-0 hidden w-72 skew-x-12 bg-gradient-to-b from-cyan-300 via-blue-500 to-cyan-400 opacity-90 lg:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">{subtitle}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                  Enhance your plan with our additional services
                </h2>
              </div>
              <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setTab('individual')}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    tab === 'individual' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  Individual products
                </button>
                <button
                  type="button"
                  onClick={() => setTab('media')}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    tab === 'media' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  Media bundles
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {visibleProducts.map((product) => (
                <AddOnCard key={product.key} product={product} onAdd={handleAdd} />
              ))}
            </div>

            <section className="mt-10">
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-slate-800">Frequently asked questions</h3>
              <div className="space-y-3">
                {faqs.map((question) => (
                  <FaqItem key={question} question={question} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className={cn('rounded-2xl p-5 text-white shadow-lg', heroTone === 'purple' ? 'bg-slate-800' : 'bg-slate-800')}>
              <p className="text-lg font-semibold text-cyan-300">Your Summary</p>
              <p className="mt-3 text-sm text-slate-400">Additional Services</p>
              <input
                type="text"
                placeholder="Your Promo Code"
                className="mt-4 w-full rounded-md border-0 bg-slate-700 px-4 py-2.5 text-sm text-white placeholder:text-slate-300 focus:outline-none"
              />
              <div className="mt-4 flex items-center justify-between rounded-md bg-slate-700 px-4 py-2.5 text-sm font-semibold">
                <span>Total</span>
                <span className="text-xl">{formatCurrency(total)}</span>
              </div>
              <p className="mt-4 text-xs leading-6 text-slate-400">
                {isLoading ? 'Loading selections…' : `${selected.length} item${selected.length === 1 ? '' : 's'} selected`}
              </p>
              <div className="mt-4 space-y-2">
                {selected.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-md bg-slate-700/80 px-3 py-2 text-xs">
                    <span className="truncate pr-3">{record.title}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(record.amount)}</span>
                      <button
                        type="button"
                        onClick={() => void deleteMutation.mutateAsync(record.id)}
                        className="text-slate-300 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
