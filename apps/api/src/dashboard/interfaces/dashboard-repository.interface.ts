import type { User } from '../../users/domain/user';
import type { Listing } from '../../listings/domain/listing';
import type { ListingStats } from '../domain/dashboard';
import type { PaginatedRecentReviews } from '../domain/moderator-dashboard';
import type { AdminUserStats, AdminOrganizationStats, AdminSystemStats } from '../domain/admin-dashboard';

export interface TodayReviewStats {
  approvedToday: number;
  rejectedToday: number;
}

export interface IDashboardRepository {
  // ── User-scoped ──────────────────────────────────────────────────────────────
  getUserProfile(userId: string): Promise<User | null>;
  getListingStats(userId: string | null): Promise<ListingStats>;
  getRecentListings(userId: string, limit: number): Promise<Listing[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // ── Platform aggregations ────────────────────────────────────────────────────
  getPlatformUserStats(): Promise<AdminUserStats>;
  getPlatformOrganizationStats(): Promise<AdminOrganizationStats>;
  getPlatformSystemStats(): Promise<AdminSystemStats>;
  getPendingReviewCount(): Promise<number>;

  // ── Moderation ────────────────────────────────────────────────────────────────
  getTodayReviewStats(): Promise<TodayReviewStats>;
  getRecentReviews(page: number, limit: number): Promise<PaginatedRecentReviews>;
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
