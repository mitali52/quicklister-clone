import { InternalServerErrorException } from '@nestjs/common';
import { ListingSearchService } from './listing-search.service';
import {
  LISTING_SEARCH_REPOSITORY,
  type IListingSearchRepository,
} from './interfaces/listing-search-repository.interface';
import type { PaginatedListingSearchResult, ListingSearchItem } from './domain/listing-search';
import type { SearchListingsDto } from './dto/search-listings.dto';

// ── Builders ─────────────────────────────────────────────────────────────────

function buildSearchItem(overrides: Partial<ListingSearchItem> = {}): ListingSearchItem {
  return {
    id: 'item-id-1',
    userId: 'user-id-1',
    title: 'Lovely 2-bed flat',
    listingType: 'residential_let',
    propertyType: 'flat',
    askingPrice: null,
    monthlyRent: 150000,
    addressLine1: '10 Downing Street',
    addressLine2: null,
    city: 'London',
    postcode: 'SW1A 2AA',
    bedrooms: 2,
    bathrooms: 1,
    primaryPhotoUrl: '/uploads/listing-media/photo.jpg',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function buildPaginatedResult(
  overrides: Partial<PaginatedListingSearchResult> = {},
): PaginatedListingSearchResult {
  return {
    items: [buildSearchItem()],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ListingSearchService', () => {
  let service: ListingSearchService;
  let repo: jest.Mocked<IListingSearchRepository>;

  beforeEach(() => {
    repo = { search: jest.fn() };

    const providers = new Map([[LISTING_SEARCH_REPOSITORY, repo]]);
    service = new ListingSearchService(providers.get(LISTING_SEARCH_REPOSITORY) as IListingSearchRepository);
  });

  describe('search', () => {
    it('returns paginated results from the repository', async () => {
      const expected = buildPaginatedResult();
      repo.search.mockResolvedValue(expected);

      const result = await service.search({});

      expect(result).toEqual(expected);
    });

    it('passes all provided filters to the repository', async () => {
      repo.search.mockResolvedValue(buildPaginatedResult());
      const dto: SearchListingsDto = {
        q: 'flat',
        listingType: 'residential_let',
        propertyType: 'flat',
        minPrice: 50000,
        maxPrice: 200000,
        minBedrooms: 1,
        maxBedrooms: 3,
        city: 'London',
        postcodePrefix: 'SW1',
        sortBy: 'price_asc',
        page: 2,
        limit: 10,
      };

      await service.search(dto);

      expect(repo.search).toHaveBeenCalledWith({
        q: 'flat',
        listingType: 'residential_let',
        propertyType: 'flat',
        minPrice: 50000,
        maxPrice: 200000,
        minBedrooms: 1,
        maxBedrooms: 3,
        city: 'London',
        postcodePrefix: 'SW1',
        sortBy: 'price_asc',
        page: 2,
        limit: 10,
      });
    });

    it('applies defaults for page, limit, and sortBy when not provided', async () => {
      repo.search.mockResolvedValue(buildPaginatedResult());

      await service.search({});

      expect(repo.search).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
          sortBy: 'newest',
        }),
      );
    });

    it('passes undefined optional filters through as undefined', async () => {
      repo.search.mockResolvedValue(buildPaginatedResult());

      await service.search({});

      expect(repo.search).toHaveBeenCalledWith(
        expect.objectContaining({
          q: undefined,
          listingType: undefined,
          propertyType: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minBedrooms: undefined,
          maxBedrooms: undefined,
          city: undefined,
          postcodePrefix: undefined,
        }),
      );
    });

    it('returns empty result when no listings match', async () => {
      const empty = buildPaginatedResult({ items: [], total: 0, totalPages: 0 });
      repo.search.mockResolvedValue(empty);

      const result = await service.search({ q: 'nonexistent' });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('returns correct pagination metadata on page 3 with limit 10', async () => {
      const paged = buildPaginatedResult({ page: 3, limit: 10, total: 50, totalPages: 5 });
      repo.search.mockResolvedValue(paged);

      const result = await service.search({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.search.mockRejectedValue(new InternalServerErrorException('DB error'));

      await expect(service.search({})).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.search.mockRejectedValue(new Error('unexpected'));

      await expect(service.search({})).rejects.toThrow(InternalServerErrorException);
    });

    it('returns item with primaryPhotoUrl when listing has a cover photo', async () => {
      const item = buildSearchItem({ primaryPhotoUrl: '/uploads/listing-media/cover.jpg' });
      repo.search.mockResolvedValue(buildPaginatedResult({ items: [item] }));

      const result = await service.search({});

      expect(result.items[0]?.primaryPhotoUrl).toBe('/uploads/listing-media/cover.jpg');
    });

    it('returns null primaryPhotoUrl for listings without photos', async () => {
      const item = buildSearchItem({ primaryPhotoUrl: null });
      repo.search.mockResolvedValue(buildPaginatedResult({ items: [item] }));

      const result = await service.search({});

      expect(result.items[0]?.primaryPhotoUrl).toBeNull();
    });
  });
});
