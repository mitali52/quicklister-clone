'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { searchListingsApi, toFeaturedListing, type ListingSearchResponse } from '@/lib/api/listing-search.api';

const DEFAULT_LIMIT = 12;

const LISTING_TYPE_LABELS: Record<string, string> = {
  '': 'Any listing',
  residential_sale: 'For Sale',
  residential_let: 'To Rent',
  commercial_sale: 'Commercial Sale',
  commercial_let: 'Commercial Let',
};

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  bedrooms_asc: 'Bedrooms: Low to High',
  bedrooms_desc: 'Bedrooms: High to Low',
};

type SearchListingType = 'residential_sale' | 'residential_let' | 'commercial_sale' | 'commercial_let' | '';
type SearchSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'bedrooms_asc' | 'bedrooms_desc';

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeListingType(value: string | null): string {
  if (value === null) return '';
  if (value === 'sale') return 'residential_sale';
  if (value === 'let') return 'residential_let';
  if (value === 'commercial') return 'commercial_sale';
  return value;
}

function normalizeSort(value: string | null): SearchSort {
  if (
    value === 'oldest' ||
    value === 'price_asc' ||
    value === 'price_desc' ||
    value === 'bedrooms_asc' ||
    value === 'bedrooms_desc'
  ) {
    return value;
  }

  return 'newest';
}

function normalizeQueryValue(value: string | null): string {
  return value?.trim() ?? '';
}

export function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => ({
      q: normalizeQueryValue(searchParams.get('q') ?? searchParams.get('location')),
      listingType: normalizeListingType(searchParams.get('listingType') ?? searchParams.get('type')),
      city: normalizeQueryValue(searchParams.get('city')),
      postcodePrefix: normalizeQueryValue(searchParams.get('postcodePrefix')),
      minPrice: toNumber(searchParams.get('minPrice')),
      maxPrice: toNumber(searchParams.get('maxPrice')),
      minBedrooms: toNumber(searchParams.get('minBedrooms')),
      maxBedrooms: toNumber(searchParams.get('maxBedrooms')),
      sortBy: normalizeSort(searchParams.get('sortBy')),
      page: toNumber(searchParams.get('page')) ?? 1,
      limit: toNumber(searchParams.get('limit')) ?? DEFAULT_LIMIT,
    }),
    [searchParams],
  );

  const [results, setResults] = useState<ListingSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchListingsApi({
          q: query.q || undefined,
          listingType: query.listingType as SearchListingType,
          city: query.city || undefined,
          postcodePrefix: query.postcodePrefix || undefined,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          minBedrooms: query.minBedrooms,
          maxBedrooms: query.maxBedrooms,
          sortBy: query.sortBy,
          page: query.page,
          limit: query.limit,
        });

        if (isMounted) {
          setResults(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load search results.');
          setResults(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      isMounted = false;
    };
  }, [query.city, query.listingType, query.limit, query.maxBedrooms, query.maxPrice, query.minBedrooms, query.minPrice, query.page, query.postcodePrefix, query.q, query.sortBy]);

  const activeFilters = useMemo(() => {
    const labels: string[] = [];

    if (query.listingType && query.listingType !== '') {
      labels.push(LISTING_TYPE_LABELS[query.listingType] ?? query.listingType);
    }
    if (query.q) labels.push(`Search: ${query.q}`);
    if (query.city) labels.push(`City: ${query.city}`);
    if (query.postcodePrefix) labels.push(`Postcode: ${query.postcodePrefix}`);
    if (query.minBedrooms !== undefined) labels.push(`Min beds: ${query.minBedrooms}`);
    if (query.maxBedrooms !== undefined) labels.push(`Max beds: ${query.maxBedrooms}`);

    return labels;
  }, [query.city, query.listingType, query.maxBedrooms, query.minBedrooms, query.postcodePrefix, query.q]);

  const totalPages = results?.meta.totalPages ?? 1;
  const currentPage = results?.meta.page ?? query.page;

  function updateSearch(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (!value || value.trim() === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete('page');
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entries = Object.fromEntries(formData.entries());

    updateSearch({
      q: String(entries.q ?? '').trim() || undefined,
      listingType: String(entries.listingType ?? ''),
      city: String(entries.city ?? '').trim() || undefined,
      postcodePrefix: String(entries.postcodePrefix ?? '').trim() || undefined,
      minPrice: String(entries.minPrice ?? '').trim() || undefined,
      maxPrice: String(entries.maxPrice ?? '').trim() || undefined,
      minBedrooms: String(entries.minBedrooms ?? '').trim() || undefined,
      maxBedrooms: String(entries.maxBedrooms ?? '').trim() || undefined,
      sortBy: String(entries.sortBy ?? 'newest'),
    });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Property Search
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find the right property faster.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Search across homes and commercial spaces with flexible filters for price, bedrooms,
              location, and listing type.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-6"
          role="search"
        >
          <label className="lg:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Search
            </span>
            <input
              name="q"
              defaultValue={query.q}
              placeholder="Town, street, postcode or keyword"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Listing type
            </span>
            <select
              name="listingType"
              defaultValue={query.listingType}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Any</option>
              <option value="residential_sale">For Sale</option>
              <option value="residential_let">To Rent</option>
              <option value="commercial_sale">Commercial Sale</option>
              <option value="commercial_let">Commercial Let</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              City
            </span>
            <input
              name="city"
              defaultValue={query.city}
              placeholder="London"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Postcode
            </span>
            <input
              name="postcodePrefix"
              defaultValue={query.postcodePrefix}
              placeholder="SW1"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sort by
            </span>
            <select
              name="sortBy"
              defaultValue={query.sortBy}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="lg:col-span-6 grid gap-4 md:grid-cols-4">
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Min price
              </span>
              <input
                name="minPrice"
                inputMode="numeric"
                defaultValue={query.minPrice ?? ''}
                placeholder="200000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Max price
              </span>
              <input
                name="maxPrice"
                inputMode="numeric"
                defaultValue={query.maxPrice ?? ''}
                placeholder="500000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Min beds
              </span>
              <input
                name="minBedrooms"
                inputMode="numeric"
                defaultValue={query.minBedrooms ?? ''}
                placeholder="2"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Max beds
              </span>
              <input
                name="maxBedrooms"
                inputMode="numeric"
                defaultValue={query.maxBedrooms ?? ''}
                placeholder="4"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </label>
          </div>

          <div className="flex items-end gap-3 lg:col-span-6">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Search listings
            </button>
            <Link
              href="/search"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Results</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLoading
                ? 'Loading listings...'
                : results
                  ? `${results.meta.total} listing${results.meta.total === 1 ? '' : 's'} found`
                  : 'Ready to search'}
            </p>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!error && isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-44 rounded-t-2xl bg-slate-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !isLoading && (results?.data.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <h3 className="text-xl font-semibold text-slate-900">No listings found</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Try widening your filters, removing the postcode, or searching a nearby city.
            </p>
          </div>
        )}

        {!error && !isLoading && (results?.data.length ?? 0) > 0 && (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list">
              {results?.data.map((item) => (
                <li key={item.id}>
                  <ListingCard listing={toFeaturedListing(item)} />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
