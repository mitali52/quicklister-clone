import { InternalServerErrorException } from '@nestjs/common';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
  type TodayReviewStats,
} from './interfaces/dashboard-repository.interface';
import type {
  PaginatedRecentReviews,
  RecentReview,
} from './domain/moderator-dashboard';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildTodayReviewStats(overrides: Partial<TodayReviewStats> = {}): TodayReviewStats {
  return { approvedToday: 5, rejectedToday: 2, ...overrides };
}

function buildRecentReview(overrides: Partial<RecentReview> = {}): RecentReview {
  return {
    id: 'review-uuid-1',
    listingId: 'listing-uuid-1',
    listingTitle: 'Modern 2-bed flat',
    listingCity: 'Manchester',
    listingPostcode: 'M1 1AB',
    decision: 'approved',
    notes: null,
    reviewerId: 'mod-uuid-1',
    reviewerName: 'Jane Moderator',
    reviewerEmail: 'jane@quicklister.co.uk',
    reviewedAt: new Date('2026-05-31T10:00:00Z'),
    ...overrides,
  };
}

function buildPaginatedReviews(
  overrides: Partial<PaginatedRecentReviews> = {},
): PaginatedRecentReviews {
  return {
    items: [buildRecentReview()],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    ...overrides,
  };
}

function buildRepo(): jest.Mocked<IDashboardRepository> {
  return {
    getUserProfile: jest.fn(),
    getListingStats: jest.fn(),
    getRecentListings: jest.fn(),
    getUnreadNotificationCount: jest.fn(),
    getPlatformUserStats: jest.fn(),
    getPlatformOrganizationStats: jest.fn(),
    getPlatformSystemStats: jest.fn(),
    getPendingReviewCount: jest.fn(),
    getTodayReviewStats: jest.fn(),
    getRecentReviews: jest.fn(),
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ModeratorDashboardService', () => {
  let service: ModeratorDashboardService;
  let repo: jest.Mocked<IDashboardRepository>;

  beforeEach(() => {
    repo = buildRepo();
    const providers = new Map([[DASHBOARD_REPOSITORY, repo]]);
    service = new ModeratorDashboardService(
      providers.get(DASHBOARD_REPOSITORY) as IDashboardRepository,
    );
  });

  // ── getDashboard ───────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('assembles and returns the moderator dashboard', async () => {
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats());
      repo.getPendingReviewCount.mockResolvedValue(12);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      const result = await service.getDashboard();

      expect(result.reviewStats.approvedToday).toBe(5);
      expect(result.reviewStats.rejectedToday).toBe(2);
      expect(result.reviewStats.pendingReviews).toBe(12);
      expect(result.queueStats.listingsWaiting).toBe(12);
    });

    it('calls repository with default page=1 and limit=10 when no params supplied', async () => {
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats());
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      await service.getDashboard();

      expect(repo.getRecentReviews).toHaveBeenCalledWith(1, 10);
    });

    it('passes custom page and limit through to the repository', async () => {
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats());
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      await service.getDashboard(3, 25);

      expect(repo.getRecentReviews).toHaveBeenCalledWith(3, 25);
    });

    it('derives pendingReviews and listingsWaiting from the same getPendingReviewCount call', async () => {
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats());
      repo.getPendingReviewCount.mockResolvedValue(7);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      const result = await service.getDashboard();

      expect(result.reviewStats.pendingReviews).toBe(7);
      expect(result.queueStats.listingsWaiting).toBe(7);
      expect(repo.getPendingReviewCount).toHaveBeenCalledTimes(1);
    });

    it('returns zero review stats when no reviews occurred today', async () => {
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats({ approvedToday: 0, rejectedToday: 0 }));
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews({ items: [], total: 0, totalPages: 0 }));

      const result = await service.getDashboard();

      expect(result.reviewStats.approvedToday).toBe(0);
      expect(result.reviewStats.rejectedToday).toBe(0);
    });

    it('includes correct pagination metadata in recentReviews', async () => {
      const reviews = Array.from({ length: 5 }, (_, i) =>
        buildRecentReview({ id: `review-uuid-${i + 1}` }),
      );
      repo.getTodayReviewStats.mockResolvedValue(buildTodayReviewStats());
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(
        buildPaginatedReviews({ items: reviews, total: 47, page: 2, limit: 5, totalPages: 10 }),
      );

      const result = await service.getDashboard(2, 5);

      expect(result.recentReviews.total).toBe(47);
      expect(result.recentReviews.page).toBe(2);
      expect(result.recentReviews.limit).toBe(5);
      expect(result.recentReviews.totalPages).toBe(10);
      expect(result.recentReviews.items).toHaveLength(5);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getTodayReviewStats.mockRejectedValue(new InternalServerErrorException());
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getTodayReviewStats.mockRejectedValue(new Error('query timeout'));
      repo.getPendingReviewCount.mockResolvedValue(0);
      repo.getRecentReviews.mockResolvedValue(buildPaginatedReviews());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
