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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateListingData {
  userId: string;
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
