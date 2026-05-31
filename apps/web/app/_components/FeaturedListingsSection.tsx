import Link from 'next/link';
import { ListingCard } from '@/components/listings/ListingCard';
import type { FeaturedListing } from '@/components/listings/ListingCard';

// Placeholder data — replace with `fetch('/api/properties?status=active&limit=6')` once API is live
const MOCK_LISTINGS: FeaturedListing[] = [
  {
    id: 'mock-1',
    type: 'residential_sale',
    title: '3-bedroom semi-detached house with garden and driveway',
    askingPrice: 32500000,
    monthlyRent: null,
    bedrooms: 3,
    bathrooms: 1,
    propertyType: 'semi_detached',
    city: 'Manchester',
    postcode: 'M14',
    coverPhotoUrl: null,
  },
  {
    id: 'mock-2',
    type: 'residential_let',
    title: 'Modern 2-bedroom flat with private balcony in Hackney',
    askingPrice: null,
    monthlyRent: 200000,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'flat',
    city: 'London',
    postcode: 'E8',
    coverPhotoUrl: null,
  },
  {
    id: 'mock-3',
    type: 'residential_sale',
    title: 'Spacious 4-bedroom detached family home with large rear garden',
    askingPrice: 55000000,
    monthlyRent: null,
    bedrooms: 4,
    bathrooms: 2,
    propertyType: 'detached',
    city: 'Bristol',
    postcode: 'BS9',
    coverPhotoUrl: null,
  },
];

export function FeaturedListingsSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="featured-listings-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="featured-listings-heading"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Latest listings
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Properties listed directly by their owners — no agents involved.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden flex-shrink-0 text-sm font-semibold text-blue-700 hover:underline sm:block"
          >
            Browse all properties &rarr;
          </Link>
        </div>

        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {MOCK_LISTINGS.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/search" className="text-sm font-semibold text-blue-700 hover:underline">
            Browse all properties &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
