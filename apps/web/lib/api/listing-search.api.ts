import { apiGet } from './client';
import type { FeaturedListing, PropertyListingType } from '@/components/listings/ListingCard';

export type SearchSortOption =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'bedrooms_asc'
  | 'bedrooms_desc';

export interface ListingSearchItem {
  id: string;
  userId: string;
  title: string;
  listingType: PropertyListingType;
  propertyType: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  primaryPhotoUrl: string | null;
  createdAt: string;
}

export interface ListingSearchMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListingSearchResponse {
  data: ListingSearchItem[];
  meta: ListingSearchMeta;
}

export interface ListingSearchParams {
  q?: string;
  listingType?: PropertyListingType | '';
  propertyType?: string;
  city?: string;
  postcodePrefix?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  sortBy?: SearchSortOption;
  page?: number;
  limit?: number;
}

export function toFeaturedListing(item: ListingSearchItem): FeaturedListing {
  return {
    id: item.id,
    type: item.listingType,
    title: item.title,
    askingPrice: item.askingPrice,
    monthlyRent: item.monthlyRent,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    propertyType: item.propertyType,
    city: item.city,
    postcode: item.postcode,
    coverPhotoUrl: item.primaryPhotoUrl,
  };
}

export function buildListingSearchQuery(params: ListingSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) searchParams.set('q', params.q.trim());
  if (params.listingType) searchParams.set('listingType', params.listingType);
  if (params.propertyType?.trim()) searchParams.set('propertyType', params.propertyType.trim());
  if (params.city?.trim()) searchParams.set('city', params.city.trim());
  if (params.postcodePrefix?.trim()) {
    searchParams.set('postcodePrefix', params.postcodePrefix.trim());
  }
  if (params.minPrice !== undefined && Number.isFinite(params.minPrice)) {
    searchParams.set('minPrice', String(params.minPrice));
  }
  if (params.maxPrice !== undefined && Number.isFinite(params.maxPrice)) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }
  if (params.minBedrooms !== undefined && Number.isFinite(params.minBedrooms)) {
    searchParams.set('minBedrooms', String(params.minBedrooms));
  }
  if (params.maxBedrooms !== undefined && Number.isFinite(params.maxBedrooms)) {
    searchParams.set('maxBedrooms', String(params.maxBedrooms));
  }
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.page !== undefined && Number.isFinite(params.page) && params.page > 0) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit !== undefined && Number.isFinite(params.limit) && params.limit > 0) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/listings/search?${query}` : '/listings/search';
}

export function searchListingsApi(
  params: ListingSearchParams = {},
): Promise<ListingSearchResponse> {
  return apiGet<ListingSearchResponse>(buildListingSearchQuery(params));
}
