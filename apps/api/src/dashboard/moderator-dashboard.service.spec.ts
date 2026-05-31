import { InternalServerErrorException } from '@nestjs/common';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import {
  MODERATOR_DASHBOARD_REPOSITORY,
  type IModeratorDashboardRepository,
} from './interfaces/moderator-dashboard-repository.interface';
import type {
  ModeratorDashboard,
  RecentReview,
  ReviewStats,
  QueueStats,
  PaginatedRecentReviews,
} from './domain/moderator-dashboard';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildReviewStats(overrides: Partial<ReviewStats> = {}): ReviewStats {
  return {
    pendingReviews: 12,
    approvedToday: 5,
    rejectedToday: 2,
    ...overrides,
  };
}

function buildQueueStats(overrides: Partial<QueueStats> = {}): QueueStats {
  return {
    listingsWaiting: 12,
    ...overrides,
  };
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

function buildDashboard(overrides: Partial<ModeratorDashboard> = {}): ModeratorDashboard {
  return {
    reviewStats: buildReviewStats(),
    queueStats: buildQueueStats(),
    recentReviews: buildPaginatedReviews(),
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ModeratorDashboardService', () => {
  let service: ModeratorDashboardService;
  let repo: jest.Mocked<IModeratorDashboardRepository>;

  beforeEach(() => {
    repo = {
      getDashboard: jest.fn(),
    };

    const providers = new Map([[MODERATOR_DASHBOARD_REPOSITORY, repo]]);
    service = new ModeratorDashboardService(
      providers.get(MODERATOR_DASHBOARD_REPOSITORY) as IModeratorDashboardRepository,
    );
  });

  // ── getDashboard ───────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('returns the moderator dashboard from the repository', async () => {
      const expected = buildDashboard();
      repo.getDashboard.mockResolvedValue(expected);

      const result = await service.getDashboard();

      expect(result).toEqual(expected);
    });

    it('calls repository with default page=1 and limit=10 when no params supplied', async () => {
      repo.getDashboard.mockResolvedValue(buildDashboard());

      await service.getDashboard();

      expect(repo.getDashboard).toHaveBeenCalledWith(1, 10);
    });

    it('passes custom page and limit through to the repository', async () => {
      repo.getDashboard.mockResolvedValue(buildDashboard());

      await service.getDashboard(3, 25);

      expect(repo.getDashboard).toHaveBeenCalledWith(3, 25);
    });

    it('returns zero review stats when no reviews have occurred today', async () => {
      const dashboard = buildDashboard({
        reviewStats: buildReviewStats({ approvedToday: 0, rejectedToday: 0 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.reviewStats.approvedToday).toBe(0);
      expect(result.reviewStats.rejectedToday).toBe(0);
    });

    it('returns an empty recentReviews list when no reviews exist', async () => {
      const dashboard = buildDashboard({
        recentReviews: buildPaginatedReviews({ items: [], total: 0, totalPages: 0 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.recentReviews.items).toHaveLength(0);
      expect(result.recentReviews.total).toBe(0);
    });

    it('includes correct pagination metadata in recentReviews', async () => {
      const reviews = Array.from({ length: 5 }, (_, i) =>
        buildRecentReview({ id: `review-uuid-${i + 1}` }),
      );
      const dashboard = buildDashboard({
        recentReviews: buildPaginatedReviews({ items: reviews, total: 47, page: 2, limit: 5, totalPages: 10 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard(2, 5);

      expect(result.recentReviews.total).toBe(47);
      expect(result.recentReviews.page).toBe(2);
      expect(result.recentReviews.limit).toBe(5);
      expect(result.recentReviews.totalPages).toBe(10);
      expect(result.recentReviews.items).toHaveLength(5);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getDashboard.mockRejectedValue(new InternalServerErrorException());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getDashboard.mockRejectedValue(new Error('query timeout'));

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
