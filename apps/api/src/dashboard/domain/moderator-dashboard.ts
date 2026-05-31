export type ReviewDecision = 'approved' | 'rejected';

export interface ReviewStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface QueueStats {
  listingsWaiting: number;
}

export interface RecentReview {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCity: string;
  listingPostcode: string;
  decision: ReviewDecision;
  notes: string | null;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewedAt: Date;
}

export interface PaginatedRecentReviews {
  items: RecentReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModeratorDashboard {
  reviewStats: ReviewStats;
  queueStats: QueueStats;
  recentReviews: PaginatedRecentReviews;
}
