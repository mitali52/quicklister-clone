import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import type { ListingSearchFilters, PaginatedListingSearchResult, SortOption } from './domain/listing-search';
import type { IListingSearchRepository } from './interfaces/listing-search-repository.interface';
import { LISTING_SEARCH_REPOSITORY } from './interfaces/listing-search-repository.interface';
import type { SearchListingsDto } from './dto/search-listings.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const DEFAULT_SORT: SortOption = 'newest';

@Injectable()
export class ListingSearchService {
  constructor(
    @Inject(LISTING_SEARCH_REPOSITORY)
    private readonly repo: IListingSearchRepository,
  ) {}

  async search(dto: SearchListingsDto): Promise<PaginatedListingSearchResult> {
    const filters: ListingSearchFilters = {
      q: dto.q,
      listingType: dto.listingType,
      propertyType: dto.propertyType,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      minBedrooms: dto.minBedrooms,
      maxBedrooms: dto.maxBedrooms,
      city: dto.city,
      postcodePrefix: dto.postcodePrefix,
      sortBy: dto.sortBy ?? DEFAULT_SORT,
      page: dto.page ?? DEFAULT_PAGE,
      limit: dto.limit ?? DEFAULT_LIMIT,
    };

    try {
      return await this.repo.search(filters);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Search failed');
    }
  }
}
