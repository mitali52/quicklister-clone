export interface ListingMedia {
  id: string;
  listingId: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingMediaData {
  listingId: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ReorderItem {
  id: string;
  sortOrder: number;
}
