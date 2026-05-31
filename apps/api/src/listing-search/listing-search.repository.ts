import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type { ListingType, PropertyType } from '../listings/domain/listing';
import type { ListingSearchFilters, ListingSearchItem, PaginatedListingSearchResult } from './domain/listing-search';
import type { IListingSearchRepository } from './interfaces/listing-search-repository.interface';
import { ListingSearchQueryBuilder } from './listing-search.query-builder';

interface ListingSearchRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  asking_price: number | null;
  monthly_rent: number | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: Date;
  updated_at: Date;
  primary_photo_url: string | null;
}

interface CountRow {
  total: string;
}

function toDomain(row: ListingSearchRow): ListingSearchItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    listingType: row.listing_type,
    propertyType: row.property_type,
    askingPrice: row.asking_price,
    monthlyRent: row.monthly_rent,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    primaryPhotoUrl: row.primary_photo_url,
    createdAt: row.created_at,
  };
}

@Injectable()
export class ListingSearchRepository implements IListingSearchRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async search(filters: ListingSearchFilters): Promise<PaginatedListingSearchResult> {
    const { sortBy, page, limit } = filters;
    const offset = (page - 1) * limit;

    const builder = this.buildQuery(filters);
    const selectQuery = builder.buildSelect(sortBy, limit, offset);
    const countQuery = builder.buildCount();

    try {
      const [selectResult, countResult] = await Promise.all([
        this.pool.query<ListingSearchRow>(selectQuery.text, selectQuery.params),
        this.pool.query<CountRow>(countQuery.text, countQuery.params),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      const items = selectResult.rows.map(toDomain);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      handleDbError(err, 'ListingSearchRepository.search');
    }
  }

  private buildQuery(filters: ListingSearchFilters): ListingSearchQueryBuilder {
    const builder = new ListingSearchQueryBuilder();

    if (filters.q !== undefined) builder.withTextSearch(filters.q);
    if (filters.listingType !== undefined) builder.withListingType(filters.listingType);
    if (filters.propertyType !== undefined) builder.withPropertyType(filters.propertyType);
    if (filters.minPrice !== undefined) builder.withMinPrice(filters.minPrice);
    if (filters.maxPrice !== undefined) builder.withMaxPrice(filters.maxPrice);
    if (filters.minBedrooms !== undefined) builder.withMinBedrooms(filters.minBedrooms);
    if (filters.maxBedrooms !== undefined) builder.withMaxBedrooms(filters.maxBedrooms);
    if (filters.city !== undefined) builder.withCity(filters.city);
    if (filters.postcodePrefix !== undefined) builder.withPostcodePrefix(filters.postcodePrefix);

    return builder;
  }
}
