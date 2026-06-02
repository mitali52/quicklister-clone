import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserDashboardService } from './dashboard.service';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { ListingStats } from './domain/dashboard';
import type { User } from '../users/domain/user';
import type { Listing } from '../listings/domain/listing';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    roleId: 'role-uuid-1',
    email: 'test@quicklister.co.uk',
    passwordHash: 'hashed',
    fullName: 'Jane Smith',
    phoneNumber: '+447700123456',
    avatarUrl: null,
    addressLine1: '10 Downing Street',
    addressLine2: null,
    city: 'London',
    county: null,
    postcode: 'SW1A 2AA',
    emailVerified: true,
    nrlaMember: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  };
}

function buildListingStats(overrides: Partial<ListingStats> = {}): ListingStats {
  return {
    totalListings: 5,
    draftListings: 2,
    pendingListings: 1,
    approvedListings: 1,
    rejectedListings: 1,
    ...overrides,
  };
}

function buildListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 'listing-uuid-1',
    userId: 'user-uuid-1',
    title: 'Modern 2-bed flat',
    description: null,
    listingType: 'residential_let',
    propertyType: 'flat',
    status: 'published',
    askingPrice: null,
    monthlyRent: 150000,
    addressLine1: '10 Market Street',
    addressLine2: null,
    city: 'Manchester',
    postcode: 'M1 1AB',
    bedrooms: 2,
    bathrooms: 1,
    createdAt: new Date('2026-01-15T00:00:00Z'),
    updatedAt: new Date('2026-01-15T00:00:00Z'),
    deletedAt: null,
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

describe('UserDashboardService', () => {
  let service: UserDashboardService;
  let repo: jest.Mocked<IDashboardRepository>;

  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    repo = buildRepo();
    const providers = new Map([[DASHBOARD_REPOSITORY, repo]]);
    service = new UserDashboardService(
      providers.get(DASHBOARD_REPOSITORY) as IDashboardRepository,
    );
  });

  // ── getUserDashboard ───────────────────────────────────────────────────────

  describe('getUserDashboard', () => {
    it('assembles and returns the full dashboard for the authenticated user', async () => {
      const profile = buildUser({ id: USER_ID });
      const stats = buildListingStats();
      const recentListings = [buildListing()];
      const unreadNotifications = 3;

      repo.getUserProfile.mockResolvedValue(profile);
      repo.getListingStats.mockResolvedValue(stats);
      repo.getRecentListings.mockResolvedValue(recentListings);
      repo.getUnreadNotificationCount.mockResolvedValue(unreadNotifications);

      const result = await service.getUserDashboard(USER_ID);

      expect(result.profile).toEqual(profile);
      expect(result.stats).toEqual(stats);
      expect(result.recentListings).toEqual(recentListings);
      expect(result.unreadNotifications).toBe(unreadNotifications);
    });

    it('calls getListingStats with the authenticated user id, not null', async () => {
      repo.getUserProfile.mockResolvedValue(buildUser());
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      await service.getUserDashboard(USER_ID);

      expect(repo.getListingStats).toHaveBeenCalledWith(USER_ID);
    });

    it('throws NotFoundException when the user profile does not exist', async () => {
      repo.getUserProfile.mockResolvedValue(null);
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns zero unreadNotifications when the user has read all notifications', async () => {
      repo.getUserProfile.mockResolvedValue(buildUser());
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      const result = await service.getUserDashboard(USER_ID);

      expect(result.unreadNotifications).toBe(0);
    });

    it('returns empty recentListings when the user has no listings', async () => {
      repo.getUserProfile.mockResolvedValue(buildUser());
      repo.getListingStats.mockResolvedValue(buildListingStats({ totalListings: 0 }));
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      const result = await service.getUserDashboard(USER_ID);

      expect(result.recentListings).toHaveLength(0);
    });

    it('calls all four repository methods exactly once', async () => {
      repo.getUserProfile.mockResolvedValue(buildUser());
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      await service.getUserDashboard(USER_ID);

      expect(repo.getUserProfile).toHaveBeenCalledTimes(1);
      expect(repo.getListingStats).toHaveBeenCalledTimes(1);
      expect(repo.getRecentListings).toHaveBeenCalledTimes(1);
      expect(repo.getUnreadNotificationCount).toHaveBeenCalledTimes(1);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getUserProfile.mockRejectedValue(new InternalServerErrorException());
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getUserProfile.mockRejectedValue(new Error('connection refused'));
      repo.getListingStats.mockResolvedValue(buildListingStats());
      repo.getRecentListings.mockResolvedValue([]);
      repo.getUnreadNotificationCount.mockResolvedValue(0);

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
