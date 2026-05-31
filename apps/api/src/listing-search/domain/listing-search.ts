import type { ListingType, PropertyType } from '../../listings/domain/listing';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'bedrooms_asc'
  | 'bedrooms_desc';

export interface ListingSearchFilters {
  q?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  city?: string;
  postcodePrefix?: string;
  sortBy: SortOption;
  page: number;
  limit: number;
}

export interface ListingSearchItem {
  id: string;
  userId: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  askingPrice: number | null;
  monthlyRent: number | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  primaryPhotoUrl: string | null;
  createdAt: Date;
}

export interface PaginatedListingSearchResult {
  items: ListingSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
