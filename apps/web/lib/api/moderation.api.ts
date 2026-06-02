import { apiGet, apiPost } from './client';

function buildQuery<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : '';
}

export interface ReviewQueueSubmitter {
  id: string;
  fullName: string;
  email: string;
}

export interface ReviewQueueItem {
  id: string;
  title: string;
  listingType: 'residential_sale' | 'residential_let' | 'commercial_sale' | 'commercial_let';
  propertyType: 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'bungalow' | 'maisonette' | 'studio' | 'other';
  askingPrice: number | null;
  monthlyRent: number | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  submittedAt: string;
  primaryPhotoUrl: string | null;
  submitter: ReviewQueueSubmitter;
}

export interface ReviewQueueResponse {
  data: ReviewQueueItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ModerationReview {
  id: string;
  listingId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  notes: string | null;
  createdAt: string;
}

export interface ModerationReviewWithReviewer extends ModerationReview {
  reviewerName: string;
  reviewerEmail: string;
}

export interface ApproveListingData {
  notes?: string;
}

export interface RejectListingData {
  notes: string;
}

export const getModerationQueueApi = (page = 1, limit = 10): Promise<ReviewQueueResponse> =>
  apiGet<ReviewQueueResponse>(`/moderation/queue${buildQuery({ page, limit })}`);

export const approveModerationListingApi = (
  listingId: string,
  data: ApproveListingData = {},
): Promise<ModerationReview> => apiPost<ModerationReview>(`/moderation/listings/${listingId}/approve`, data);

export const rejectModerationListingApi = (
  listingId: string,
  data: RejectListingData,
): Promise<ModerationReview> => apiPost<ModerationReview>(`/moderation/listings/${listingId}/reject`, data);

export const getModerationReviewHistoryApi = (
  listingId: string,
): Promise<ModerationReviewWithReviewer[]> =>
  apiGet<ModerationReviewWithReviewer[]>(`/moderation/listings/${listingId}/reviews`);
