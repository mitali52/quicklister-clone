'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type SearchType = 'sale' | 'let';

const TABS: { value: SearchType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'let', label: 'To Rent' },
];

const SEARCH_TYPE_TO_LISTING_TYPE: Record<SearchType, 'residential_sale' | 'residential_let'> = {
  sale: 'residential_sale',
  let: 'residential_let',
};

export function PropertySearch() {
  const [type, setType] = useState<SearchType>('sale');
  const [location, setLocation] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams({ listingType: SEARCH_TYPE_TO_LISTING_TYPE[type] });
    if (location.trim()) params.set('q', location.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="bg-white py-8 shadow-sm" aria-label="Property search">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          role="search"
        >
          {/* Type toggle */}
          <div
            className="flex overflow-hidden rounded-lg border border-slate-200 flex-shrink-0"
            role="group"
            aria-label="Listing type"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setType(tab.value)}
                aria-pressed={type === tab.value}
                className={cn(
                  'px-5 py-2.5 text-sm font-semibold transition-colors',
                  type === tab.value
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location */}
          <div className="flex-1">
            <label htmlFor="search-location" className="sr-only">
              Town, city or postcode
            </label>
            <input
              id="search-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Town, city or postcode"
              autoComplete="postal-code"
              className="h-full w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Find Properties
          </button>
        </form>
      </div>
    </section>
  );
}
