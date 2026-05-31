import type { ListingMedia, CreateListingMediaData, ReorderItem } from '../domain/listing-media';

export interface IListingMediaRepository {
  findByListingId(listingId: string): Promise<ListingMedia[]>;
  findById(id: string): Promise<ListingMedia | null>;
  findListingOwner(listingId: string): Promise<string | null>;
  countByListingId(listingId: string): Promise<number>;
  create(data: CreateListingMediaData): Promise<ListingMedia>;
  reorder(listingId: string, items: ReorderItem[]): Promise<ListingMedia[]>;
  delete(id: string): Promise<ListingMedia>;
}

export const LISTING_MEDIA_REPOSITORY = Symbol('LISTING_MEDIA_REPOSITORY');
