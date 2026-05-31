import { z } from 'zod';

const listingTypeValues = ['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'] as const;
const propertyTypeValues = ['detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other'] as const;

const ukPostcode = z
  .string()
  .regex(
    /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    'Must be a valid UK postcode (e.g. SW1A 1AA)',
  );

export const CreateListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional().or(z.literal('')),
  listingType: z.enum(listingTypeValues, { message: 'Listing type is required' }),
  propertyType: z.enum(propertyTypeValues, { message: 'Property type is required' }),
  askingPrice: z.number().int('Must be a whole number in pence').min(1).optional(),
  monthlyRent: z.number().int('Must be a whole number in pence').min(1).optional(),
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(100),
  postcode: ukPostcode,
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
});

export const UpdateListingSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(5000).optional().or(z.literal('')),
  listingType: z.enum(listingTypeValues).optional(),
  propertyType: z.enum(propertyTypeValues).optional(),
  askingPrice: z.number().int().min(1).optional(),
  monthlyRent: z.number().int().min(1).optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(1).max(100).optional(),
  postcode: ukPostcode.optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
});

export type CreateListing = z.infer<typeof CreateListingSchema>;
export type UpdateListing = z.infer<typeof UpdateListingSchema>;

export const LISTING_TYPE_LABELS: Record<string, string> = {
  residential_sale: 'Residential Sale',
  residential_let: 'Residential Let',
  commercial_sale: 'Commercial Sale',
  commercial_let: 'Commercial Let',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  detached: 'Detached',
  semi_detached: 'Semi-detached',
  terraced: 'Terraced',
  flat: 'Flat',
  bungalow: 'Bungalow',
  maisonette: 'Maisonette',
  studio: 'Studio',
  other: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  archived: 'Archived',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
};
