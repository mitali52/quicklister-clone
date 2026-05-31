import type { ListingType, PropertyType } from '../../listings/domain/listing';

export type ReviewDecision = 'approved' | 'rejected';

export interface ModerationReview {
  id: string;
  listingId: string;
  reviewerId: string;
  decision: ReviewDecision;
  notes: string | null;
  createdAt: Date;
}

// Returned by the audit-trail endpoint — includes reviewer identity
export interface ModerationReviewWithReviewer extends ModerationReview {
  reviewerName: string;
  reviewerEmail: string;
}

export interface CreateReviewData {
  listingId: string;
  reviewerId: string;
  decision: ReviewDecision;
  notes: string | null;
}

export interface ReviewQueueItem {
  id: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  askingPrice: number | null;
  monthlyRent: number | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  submittedAt: Date;
  primaryPhotoUrl: string | null;
  submitter: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PaginatedQueueResult {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
