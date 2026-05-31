import { InternalServerErrorException } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  ADMIN_DASHBOARD_REPOSITORY,
  type IAdminDashboardRepository,
} from './interfaces/admin-dashboard-repository.interface';
import type {
  AdminDashboard,
  AdminUserStats,
  AdminOrganizationStats,
  AdminListingStats,
  AdminModerationStats,
  AdminSystemStats,
} from './domain/admin-dashboard';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildUserStats(overrides: Partial<AdminUserStats> = {}): AdminUserStats {
  return { totalUsers: 100, activeUsers: 90, blockedUsers: 10, ...overrides };
}

function buildOrganizationStats(
  overrides: Partial<AdminOrganizationStats> = {},
): AdminOrganizationStats {
  return { totalOrganizations: 20, activeOrganizations: 18, ...overrides };
}

function buildListingStats(overrides: Partial<AdminListingStats> = {}): AdminListingStats {
  return {
    totalListings: 250,
    draftListings: 80,
    pendingListings: 15,
    approvedListings: 140,
    rejectedListings: 15,
    ...overrides,
  };
}

function buildModerationStats(overrides: Partial<AdminModerationStats> = {}): AdminModerationStats {
  return { pendingReviews: 15, ...overrides };
}

function buildSystemStats(overrides: Partial<AdminSystemStats> = {}): AdminSystemStats {
  return { notificationsSent: 5000, auditLogsGenerated: 12000, ...overrides };
}

function buildDashboard(overrides: Partial<AdminDashboard> = {}): AdminDashboard {
  return {
    users: buildUserStats(),
    organizations: buildOrganizationStats(),
    listings: buildListingStats(),
    moderation: buildModerationStats(),
    system: buildSystemStats(),
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let repo: jest.Mocked<IAdminDashboardRepository>;

  beforeEach(() => {
    repo = { getDashboard: jest.fn() };

    const providers = new Map([[ADMIN_DASHBOARD_REPOSITORY, repo]]);
    service = new AdminDashboardService(
      providers.get(ADMIN_DASHBOARD_REPOSITORY) as IAdminDashboardRepository,
    );
  });

  // ── getDashboard ───────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('returns the admin dashboard from the repository', async () => {
      const expected = buildDashboard();
      repo.getDashboard.mockResolvedValue(expected);

      const result = await service.getDashboard();

      expect(result).toEqual(expected);
    });

    it('exposes correct user stats including blocked count', async () => {
      const dashboard = buildDashboard({
        users: buildUserStats({ totalUsers: 200, activeUsers: 180, blockedUsers: 20 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.users.totalUsers).toBe(200);
      expect(result.users.activeUsers).toBe(180);
      expect(result.users.blockedUsers).toBe(20);
    });

    it('exposes correct organization stats', async () => {
      const dashboard = buildDashboard({
        organizations: buildOrganizationStats({ totalOrganizations: 50, activeOrganizations: 45 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.organizations.totalOrganizations).toBe(50);
      expect(result.organizations.activeOrganizations).toBe(45);
    });

    it('returns zero stats when the platform has no data', async () => {
      const dashboard = buildDashboard({
        users: buildUserStats({ totalUsers: 0, activeUsers: 0, blockedUsers: 0 }),
        organizations: buildOrganizationStats({ totalOrganizations: 0, activeOrganizations: 0 }),
        listings: buildListingStats({
          totalListings: 0,
          draftListings: 0,
          pendingListings: 0,
          approvedListings: 0,
          rejectedListings: 0,
        }),
        moderation: buildModerationStats({ pendingReviews: 0 }),
        system: buildSystemStats({ notificationsSent: 0, auditLogsGenerated: 0 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.users.totalUsers).toBe(0);
      expect(result.listings.totalListings).toBe(0);
      expect(result.system.notificationsSent).toBe(0);
    });

    it('returns matching pendingListings and pendingReviews counts', async () => {
      const pendingCount = 7;
      const dashboard = buildDashboard({
        listings: buildListingStats({ pendingListings: pendingCount }),
        moderation: buildModerationStats({ pendingReviews: pendingCount }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.listings.pendingListings).toBe(pendingCount);
      expect(result.moderation.pendingReviews).toBe(pendingCount);
    });

    it('exposes system stats for notifications and audit logs', async () => {
      const dashboard = buildDashboard({
        system: buildSystemStats({ notificationsSent: 8400, auditLogsGenerated: 21000 }),
      });
      repo.getDashboard.mockResolvedValue(dashboard);

      const result = await service.getDashboard();

      expect(result.system.notificationsSent).toBe(8400);
      expect(result.system.auditLogsGenerated).toBe(21000);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getDashboard.mockRejectedValue(new InternalServerErrorException());

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getDashboard.mockRejectedValue(new Error('connection lost'));

      await expect(service.getDashboard()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
