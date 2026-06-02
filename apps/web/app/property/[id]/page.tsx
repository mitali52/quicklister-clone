import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPence } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ListingResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  listingType: 'residential_sale' | 'residential_let' | 'commercial_sale' | 'commercial_let';
  propertyType: string;
  status: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  createdAt: string;
  updatedAt: string;
}

async function getListing(id: string): Promise<ListingResponse | null> {
  const res = await fetch(`${API_URL}/listings/${id}`, { cache: 'no-store' });

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) {
    throw new Error(`Failed to load listing ${id}`);
  }

  return (await res.json()) as ListingResponse;
}

function formatType(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return {
      title: 'Property not found',
    };
  }

  return {
    title: listing.title,
    description: `${listing.city} ${listing.postcode} - ${formatType(listing.listingType)} property.`,
    alternates: {
      canonical: `/property/${id}`,
    },
    openGraph: {
      title: listing.title,
      description: `${listing.city} ${listing.postcode} - ${formatType(listing.listingType)} property.`,
      url: `https://quicklister.co.uk/property/${id}`,
      siteName: 'Quicklister',
      type: 'article',
    },
  };
}

export default async function PropertyPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const isSale = listing.listingType === 'residential_sale' || listing.listingType === 'commercial_sale';
  const priceValue = isSale ? listing.askingPrice : listing.monthlyRent;
  const priceLabel = priceValue !== null ? formatPence(priceValue) : 'POA';
  const priceSuffix = !isSale && priceValue !== null ? ' pcm' : '';
  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: listing.title,
    description: listing.description ?? `${listing.city} ${listing.postcode}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.addressLine1,
      addressLocality: listing.city,
      postalCode: listing.postcode,
      addressCountry: 'GB',
    },
    offers: {
      '@type': 'Offer',
      price: priceValue !== null ? priceValue / 100 : undefined,
      priceCurrency: 'GBP',
      availability: listing.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd),
        }}
      />
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/search" className="font-semibold text-cyan-700 hover:underline">
                Property Search
              </Link>
              <span>/</span>
              <span>{formatType(listing.listingType)}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-3 text-base text-slate-600">
              {listing.addressLine1}
              {listing.addressLine2 ? `, ${listing.addressLine2}` : ''}, {listing.city}, {listing.postcode}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                {formatType(listing.listingType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatType(listing.propertyType)}
              </span>
              {listing.bedrooms !== null && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}
                </span>
              )}
              {listing.bathrooms !== null && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
              <p className="text-sm font-medium text-slate-300">Price</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight">
                {priceLabel}
                {priceSuffix && <span className="text-lg font-medium text-slate-300">{priceSuffix}</span>}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Listed directly by the owner on Quicklister.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {listing.description ?? 'No description has been provided for this listing yet.'}
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-cyan-50">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V7l7-4 7 4v14" />
                      <path d="M9 21v-8h6v8" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {listing.listingType.replace(/_/g, ' ')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{priceLabel}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Enquire about this property</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Sign in to save the listing, message the owner, or continue through the platform.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  Create account
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
