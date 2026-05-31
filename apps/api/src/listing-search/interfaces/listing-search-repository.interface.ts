import type { ListingSearchFilters, PaginatedListingSearchResult } from '../domain/listing-search';

export interface IListingSearchRepository {
  search(filters: ListingSearchFilters): Promise<PaginatedListingSearchResult>;
}

export const LISTING_SEARCH_REPOSITORY = Symbol('LISTING_SEARCH_REPOSITORY');
