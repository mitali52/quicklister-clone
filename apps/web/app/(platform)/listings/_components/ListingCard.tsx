import Link from 'next/link';
import { ListingStatusBadge } from './ListingStatusBadge';
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/schemas/listing.schemas';
import type { Listing } from '@/lib/api/listings.api';

interface ListingCardProps {
  listing: Listing;
}

function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pounds);
}

export function ListingCard({ listing }: ListingCardProps) {
  const priceLabel = listing.monthlyRent
    ? `${formatPrice(listing.monthlyRent)} pcm`
    : listing.askingPrice
      ? formatPrice(listing.askingPrice)
      : null;

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
            {listing.title}
          </h3>
          <ListingStatusBadge status={listing.status} className="shrink-0" />
        </div>

        <p className="text-xs text-slate-500 mb-3">
          {listing.addressLine1}, {listing.city} · {listing.postcode}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-md bg-slate-50 px-2 py-1">
            {LISTING_TYPE_LABELS[listing.listingType] ?? listing.listingType}
          </span>
          <span className="rounded-md bg-slate-50 px-2 py-1">
            {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
          </span>
          {listing.bedrooms !== null && (
            <span className="rounded-md bg-slate-50 px-2 py-1">{listing.bedrooms} bed</span>
          )}
          {listing.bathrooms !== null && (
            <span className="rounded-md bg-slate-50 px-2 py-1">{listing.bathrooms} bath</span>
          )}
        </div>

        {priceLabel && (
          <p className="mt-3 text-sm font-semibold text-slate-900">{priceLabel}</p>
        )}
      </article>
    </Link>
  );
}
