import { apiGet, apiPatch, apiDelete, apiUpload } from './client';

export interface ListingMedia {
  id: string;
  listingId: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderMediaItem {
  id: string;
  sortOrder: number;
}

export const getListingMediaApi = (listingId: string): Promise<ListingMedia[]> =>
  apiGet<ListingMedia[]>(`/listings/${listingId}/media`);

export const uploadListingMediaApi = (listingId: string, file: File): Promise<ListingMedia> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<ListingMedia>(`/listings/${listingId}/media`, formData);
};

export const reorderListingMediaApi = (
  listingId: string,
  items: ReorderMediaItem[],
): Promise<ListingMedia[]> =>
  apiPatch<ListingMedia[]>(`/listings/${listingId}/media/reorder`, { items });

export const deleteListingMediaApi = (listingId: string, mediaId: string): Promise<void> =>
  apiDelete<void>(`/listings/${listingId}/media/${mediaId}`);
