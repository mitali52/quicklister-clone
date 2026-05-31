import Link from 'next/link';
import Image from 'next/image';
import { formatPence } from '@/lib/utils';

export type PropertyListingType =
  | 'residential_sale'
  | 'residential_let'
  | 'commercial_sale'
  | 'commercial_let';

export interface FeaturedListing {
  id: string;
  type: PropertyListingType;
  title: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string;
  city: string;
  postcode: string;
  coverPhotoUrl: string | null;
}

interface ListingCardProps {
  listing: FeaturedListing;
}

const BADGE_LABELS: Record<PropertyListingType, string> = {
  residential_sale: 'For Sale',
  residential_let: 'To Rent',
  commercial_sale: 'Commercial Sale',
  commercial_let: 'Commercial Let',
};

function formatPropertyType(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function PlaceholderImage() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100">
      <svg
        className="h-14 w-14 text-slate-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
        />
      </svg>
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const isSale = listing.type === 'residential_sale' || listing.type === 'commercial_sale';
  const pence = isSale ? listing.askingPrice : listing.monthlyRent;
  const priceLabel = pence !== null ? formatPence(pence) : 'POA';
  const priceSuffix = !isSale && pence !== null ? ' pcm' : '';

  return (
    <Link
      href={`/property/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Cover photo */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {listing.coverPhotoUrl !== null ? (
          <Image
            src={listing.coverPhotoUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <PlaceholderImage />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-2.5 py-0.5 text-xs font-semibold text-white">
          {BADGE_LABELS[listing.type]}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xl font-bold text-slate-900">
          {priceLabel}
          {priceSuffix && (
            <span className="text-sm font-normal text-slate-500">{priceSuffix}</span>
          )}
        </p>

        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-blue-700">
          {listing.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {listing.bedrooms !== null && (
            <span>
              {listing.bedrooms}&nbsp;bed{listing.bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {listing.bathrooms !== null && (
            <span>
              {listing.bathrooms}&nbsp;bath{listing.bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          <span>{formatPropertyType(listing.propertyType)}</span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {listing.city}, {listing.postcode}
        </p>
      </div>
    </Link>
  );
}
