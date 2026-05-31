import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type ListingType = 'residential_sale' | 'residential_let' | 'commercial_sale' | 'commercial_let';
export type PropertyType = 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'bungalow' | 'maisonette' | 'studio' | 'other';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  listingType: ListingType;
  propertyType: PropertyType;
  status: ListingStatus;
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

export interface PaginatedListings {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateListingData {
  title: string;
  description?: string;
  listingType: ListingType;
  propertyType: PropertyType;
  askingPrice?: number;
  monthlyRent?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  bedrooms?: number;
  bathrooms?: number;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  askingPrice?: number;
  monthlyRent?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export const getMyListingsApi = (page = 1, limit = 20): Promise<PaginatedListings> =>
  apiGet<PaginatedListings>(`/listings/me?page=${page}&limit=${limit}`);

export const getListingApi = (id: string): Promise<Listing> =>
  apiGet<Listing>(`/listings/${id}`);

export const getPendingReviewListingsApi = (page = 1, limit = 20): Promise<PaginatedListings> =>
  apiGet<PaginatedListings>(`/listings/pending-review?page=${page}&limit=${limit}`);

export const getAllListingsApi = (page = 1, limit = 20): Promise<PaginatedListings> =>
  apiGet<PaginatedListings>(`/listings?page=${page}&limit=${limit}`);

export const createListingApi = (data: CreateListingData): Promise<Listing> =>
  apiPost<Listing>('/listings', data);

export const updateListingApi = (id: string, data: UpdateListingData): Promise<Listing> =>
  apiPatch<Listing>(`/listings/${id}`, data);

export const submitListingForReviewApi = (id: string): Promise<Listing> =>
  apiPost<Listing>(`/listings/${id}/submit`, {});

export const publishListingApi = (id: string): Promise<Listing> =>
  apiPost<Listing>(`/listings/${id}/publish`, {});

export const archiveListingApi = (id: string): Promise<Listing> =>
  apiPost<Listing>(`/listings/${id}/archive`, {});

export const deleteListingApi = (id: string): Promise<void> =>
  apiDelete<void>(`/listings/${id}`);
