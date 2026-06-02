import { InternalServerErrorException } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { ListingStats } from './domain/dashboard';
import type {
  AdminUserStats,
  AdminOrganizationStats,
  AdminSystemStats,
} from './domain/admin-dashboard';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildListingStats(overrides: Partial<ListingStats> = {}): ListingStats {
  return {
    totalListings: 250,
    draftListings: 80,
    pendingListings: 15,
    approvedListings: 140,
    rejectedListings: 15,
    ...overrides,
  };
}

function buildUserStats(overrides: Partial<AdminUserStats> = {}): AdminUserStats {
  return { totalUsers: 100, activeUsers: 90, blockedUsers: 10, ...overrides };
}

function buildOrganizationStats(
  overrides: Partial<AdminOrganizationStats> = {},
): AdminOrganizationStats {
  return { totalOrganizations: 20, activeOrganizations: 18, ...overrides };
}

function buildSystemStats(overrides: Partial<AdminSystemStats> = {}): AdminSystemStats {
  return { notificationsSent: 5000, auditLogsGenerated: 12000, ...overrides };
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

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let repo: jest.Mocked<IDashboardRepository>;

  beforeEach(() => {
    repo = buildRepo();
    const providers = new Map([[DASHBOARD_REPOSITORY, repo]]);
    service = new AdminDashboardService(
      providers.get(DASHBOARD_REPOSITORY) as IDashboardRepository,
    );
  });

  // ── getDashboard ───────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('assembles and returns the full admin dashboard', async () => {
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      const result = await service.getDashboard();

      expect(result.users.totalUsers).toBe(100);
      expect(result.organizations.totalOrganizations).toBe(20);
      expect(result.listings.totalListings).toBe(250);
      expect(result.system.notificationsSent).toBe(5000);
    });

    it('calls getListingStats with null for platform-wide scope', async () => {
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      await service.getDashboard();

      expect(repo.getListingStats).toHaveBeenCalledWith(null);
    });

    it('derives moderation.pendingReviews from listings.pendingListings without an extra query', async () => {
      const pendingListings = 7;
      repo.getListingStats.mockResolvedValue(buildListingStats({ pendingListings }));
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      const result = await service.getDashboard();

      expect(result.moderation.pendingReviews).toBe(pendingListings);
      expect(result.listings.pendingListings).toBe(pendingListings);
      expect(repo.getPendingReviewCount).not.toHaveBeenCalled();
    });

    it('returns zero stats when the platform has no data', async () => {
      repo.getListingStats.mockResolvedValue(
        buildListingStats({ totalListings: 0, draftListings: 0, pendingListings: 0, approvedListings: 0, rejectedListings: 0 }),
      );
      repo.getPlatformUserStats.mockResolvedValue(
        buildUserStats({ totalUsers: 0, activeUsers: 0, blockedUsers: 0 }),
      );
      repo.getPlatformOrganizationStats.mockResolvedValue(
        buildOrganizationStats({ totalOrganizations: 0, activeOrganizations: 0 }),
      );
      repo.getPlatformSystemStats.mockResolvedValue(
        buildSystemStats({ notificationsSent: 0, auditLogsGenerated: 0 }),
      );

      const result = await service.getDashboard();

      expect(result.users.totalUsers).toBe(0);
      expect(result.listings.totalListings).toBe(0);
      expect(result.moderation.pendingReviews).toBe(0);
      expect(result.system.notificationsSent).toBe(0);
    });

    it('exposes system stats for notifications and audit logs', async () => {
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(
        buildSystemStats({ notificationsSent: 8400, auditLogsGenerated: 21000 }),
      );

      const result = await service.getDashboard();

      expect(result.system.notificationsSent).toBe(8400);
      expect(result.system.auditLogsGenerated).toBe(21000);
    });

    it('calls all four repository methods exactly once', async () => {
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      await service.getDashboard();

      expect(repo.getListingStats).toHaveBeenCalledTimes(1);
      expect(repo.getPlatformUserStats).toHaveBeenCalledTimes(1);
      expect(repo.getPlatformOrganizationStats).toHaveBeenCalledTimes(1);
      expect(repo.getPlatformSystemStats).toHaveBeenCalledTimes(1);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getListingStats.mockRejectedValue(new InternalServerErrorException());
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getListingStats.mockRejectedValue(new Error('connection lost'));
      repo.getPlatformUserStats.mockResolvedValue(buildUserStats());
      repo.getPlatformOrganizationStats.mockResolvedValue(buildOrganizationStats());
      repo.getPlatformSystemStats.mockResolvedValue(buildSystemStats());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
