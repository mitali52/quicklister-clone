import type { Listing, CreateListingData, UpdateListingData, ListingStatus } from '../domain/listing';

export interface PaginationOpts {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IListingsRepository {
  findAll(opts: PaginationOpts): Promise<PaginatedResult<Listing>>;
  findById(id: string): Promise<Listing | null>;
  findByUserId(userId: string, opts: PaginationOpts): Promise<PaginatedResult<Listing>>;
  findByStatus(status: ListingStatus, opts: PaginationOpts): Promise<PaginatedResult<Listing>>;
  create(data: CreateListingData): Promise<Listing>;
  update(id: string, data: UpdateListingData): Promise<Listing>;
  updateStatus(id: string, status: ListingStatus): Promise<Listing>;
  softDelete(id: string): Promise<void>;
}

export const LISTINGS_REPOSITORY = Symbol('LISTINGS_REPOSITORY');
