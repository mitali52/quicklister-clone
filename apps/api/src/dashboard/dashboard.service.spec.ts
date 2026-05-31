import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { UserDashboard, ListingStats } from './domain/dashboard';
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

function buildStats(overrides: Partial<ListingStats> = {}): ListingStats {
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

function buildDashboard(overrides: Partial<UserDashboard> = {}): UserDashboard {
  return {
    profile: buildUser(),
    stats: buildStats(),
    recentListings: [buildListing()],
    unreadNotifications: 3,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: jest.Mocked<IDashboardRepository>;

  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    repo = {
      getUserDashboard: jest.fn(),
    };

    const providers = new Map([[DASHBOARD_REPOSITORY, repo]]);
    service = new DashboardService(providers.get(DASHBOARD_REPOSITORY) as IDashboardRepository);
  });

  // ── getUserDashboard ───────────────────────────────────────────────────────

  describe('getUserDashboard', () => {
    it('returns the dashboard for the authenticated user', async () => {
      const expected = buildDashboard();
      repo.getUserDashboard.mockResolvedValue(expected);

      const result = await service.getUserDashboard(USER_ID);

      expect(repo.getUserDashboard).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual(expected);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.getUserDashboard.mockResolvedValue(null);

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('includes correct listing stats shape', async () => {
      const stats = buildStats({
        totalListings: 10,
        draftListings: 3,
        pendingListings: 2,
        approvedListings: 4,
        rejectedListings: 1,
      });
      repo.getUserDashboard.mockResolvedValue(buildDashboard({ stats }));

      const result = await service.getUserDashboard(USER_ID);

      expect(result.stats.totalListings).toBe(10);
      expect(result.stats.draftListings).toBe(3);
      expect(result.stats.pendingListings).toBe(2);
      expect(result.stats.approvedListings).toBe(4);
      expect(result.stats.rejectedListings).toBe(1);
    });

    it('returns an empty recentListings array when user has no listings', async () => {
      repo.getUserDashboard.mockResolvedValue(
        buildDashboard({ recentListings: [], stats: buildStats({ totalListings: 0 }) }),
      );

      const result = await service.getUserDashboard(USER_ID);

      expect(result.recentListings).toHaveLength(0);
    });

    it('returns zero unreadNotifications when user has no unread notifications', async () => {
      repo.getUserDashboard.mockResolvedValue(buildDashboard({ unreadNotifications: 0 }));

      const result = await service.getUserDashboard(USER_ID);

      expect(result.unreadNotifications).toBe(0);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.getUserDashboard.mockRejectedValue(new InternalServerErrorException());

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.getUserDashboard.mockRejectedValue(new Error('connection refused'));

      await expect(service.getUserDashboard(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
