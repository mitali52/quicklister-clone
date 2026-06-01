import { apiGet } from './client';

export interface DashboardListingStats {
  totalListings: number;
  draftListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
}

export interface DashboardUserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  emailVerified: boolean;
  nrlaMember: boolean;
  createdAt: string;
}

export interface DashboardRecentListing {
  id: string;
  title: string;
  status: string;
  listingType: string;
  propertyType: string;
  city: string;
  postcode: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDashboardResponse {
  profile: DashboardUserProfile;
  stats: DashboardListingStats;
  recentListings: DashboardRecentListing[];
  unreadNotifications: number;
}

export interface ModeratorReviewStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface ModeratorQueueStats {
  listingsWaiting: number;
}

export interface ModeratorRecentReview {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCity: string;
  listingPostcode: string;
  decision: 'approved' | 'rejected';
  notes: string | null;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewedAt: string;
}

export interface PaginatedRecentReviews {
  items: ModeratorRecentReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModeratorDashboardResponse {
  reviewStats: ModeratorReviewStats;
  queueStats: ModeratorQueueStats;
  recentReviews: PaginatedRecentReviews;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface AdminOrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
}

export interface AdminListingStats extends DashboardListingStats {}

export interface AdminModerationStats {
  pendingReviews: number;
}

export interface AdminSystemStats {
  notificationsSent: number;
  auditLogsGenerated: number;
}

export interface AdminDashboardResponse {
  users: AdminUserStats;
  organizations: AdminOrganizationStats;
  listings: AdminListingStats;
  moderation: AdminModerationStats;
  system: AdminSystemStats;
}

export const getUserDashboard = (): Promise<UserDashboardResponse> =>
  apiGet<UserDashboardResponse>('/dashboard/user');

export const getModeratorDashboard = (
  page = 1,
  limit = 10,
): Promise<ModeratorDashboardResponse> =>
  apiGet<ModeratorDashboardResponse>(`/dashboard/moderator?page=${page}&limit=${limit}`);

export const getAdminDashboard = (): Promise<AdminDashboardResponse> =>
  apiGet<AdminDashboardResponse>('/dashboard/admin');
