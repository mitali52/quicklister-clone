import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ADMIN_REPOSITORY,
  type IAdminRepository,
} from './interfaces/admin-repository.interface';
import type {
  AdminAuditLog,
  AdminListingDetail,
  AdminListingListItem,
  AdminOrgDetail,
  AdminOrgListItem,
  AdminPlatformActivity,
  AdminUserDetail,
  AdminUserListItem,
  PaginatedAdminResult,
} from './domain/admin';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildUserListItem(
  overrides: Partial<AdminUserListItem> = {},
): AdminUserListItem {
  return {
    id: 'user-uuid-1',
    email: 'user@example.com',
    fullName: 'Test User',
    roleName: 'user',
    emailVerified: true,
    createdAt: new Date('2026-01-01'),
    suspendedAt: null,
    ...overrides,
  };
}

function buildUserDetail(overrides: Partial<AdminUserDetail> = {}): AdminUserDetail {
  return {
    ...buildUserListItem(),
    phoneNumber: null,
    avatarUrl: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    county: null,
    postcode: null,
    nrlaMember: false,
    updatedAt: new Date('2026-01-01'),
    listingCount: 0,
    organizationCount: 0,
    ...overrides,
  };
}

function buildOrgListItem(
  overrides: Partial<AdminOrgListItem> = {},
): AdminOrgListItem {
  return {
    id: 'org-uuid-1',
    ownerId: 'user-uuid-1',
    ownerName: 'Test User',
    ownerEmail: 'user@example.com',
    name: 'Test Org',
    slug: 'test-org',
    listingCount: 0,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildOrgDetail(overrides: Partial<AdminOrgDetail> = {}): AdminOrgDetail {
  return {
    ...buildOrgListItem(),
    description: null,
    logoUrl: null,
    websiteUrl: null,
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildListingListItem(
  overrides: Partial<AdminListingListItem> = {},
): AdminListingListItem {
  return {
    id: 'listing-uuid-1',
    userId: 'user-uuid-1',
    ownerName: 'Test User',
    ownerEmail: 'user@example.com',
    title: 'Nice 2-bed flat',
    listingType: 'residential_let',
    propertyType: 'flat',
    status: 'draft',
    city: 'London',
    postcode: 'E1 6RF',
    askingPrice: null,
    monthlyRent: 120000,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildListingDetail(
  overrides: Partial<AdminListingDetail> = {},
): AdminListingDetail {
  return {
    ...buildListingListItem(),
    description: null,
    addressLine1: '1 Test Street',
    addressLine2: null,
    bedrooms: 2,
    bathrooms: 1,
    deletedAt: null,
    mediaCount: 0,
    ...overrides,
  };
}

function buildAuditLog(overrides: Partial<AdminAuditLog> = {}): AdminAuditLog {
  return {
    id: 'audit-uuid-1',
    adminId: 'admin-uuid-1',
    adminName: 'Admin User',
    adminEmail: 'admin@quicklister.co.uk',
    action: 'user.suspend',
    resourceType: 'user',
    resourceId: 'user-uuid-1',
    metadata: {},
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildPaginatedResult<T>(
  items: T[],
  overrides: Partial<PaginatedAdminResult<T>> = {},
): PaginatedAdminResult<T> {
  return {
    items,
    total: items.length,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

function buildPlatformActivity(
  overrides: Partial<AdminPlatformActivity> = {},
): AdminPlatformActivity {
  return {
    users: { total: 10, active: 8, suspended: 2 },
    organizations: { total: 3 },
    listings: { total: 15, byStatus: { draft: 5, published: 8, archived: 2 } },
    recentAuditLogs: [],
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AdminService', () => {
  let service: AdminService;
  let repo: jest.Mocked<IAdminRepository>;

  const ADMIN_ID = 'admin-uuid-1';
  const USER_ID = 'user-uuid-1';
  const ORG_ID = 'org-uuid-1';
  const LISTING_ID = 'listing-uuid-1';

  beforeEach(() => {
    repo = {
      findUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUserSuspension: jest.fn(),
      findOrganizations: jest.fn(),
      findOrganizationById: jest.fn(),
      findListings: jest.fn(),
      findListingById: jest.fn(),
      updateListingStatus: jest.fn(),
      createAuditLog: jest.fn(),
      findAuditLogs: jest.fn(),
      getPlatformActivity: jest.fn(),
    };

    const providers = new Map([[ADMIN_REPOSITORY, repo]]);
    service = new AdminService(providers.get(ADMIN_REPOSITORY) as IAdminRepository);
  });

  // ── listUsers ─────────────────────────────────────────────────────────────

  describe('listUsers', () => {
    it('returns paginated user list from repository', async () => {
      const expected = buildPaginatedResult([buildUserListItem()]);
      repo.findUsers.mockResolvedValue(expected);

      const result = await service.listUsers({});

      expect(result).toEqual(expected);
    });

    it('applies default page=1 and limit=20 when not provided', async () => {
      repo.findUsers.mockResolvedValue(buildPaginatedResult([]));

      await service.listUsers({});

      expect(repo.findUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('forwards search, roleName, and suspended filters', async () => {
      repo.findUsers.mockResolvedValue(buildPaginatedResult([]));

      await service.listUsers({ search: 'alice', roleName: 'user', suspended: true });

      expect(repo.findUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'alice', roleName: 'user', suspended: true }),
      );
    });

    it('returns empty list when no users match', async () => {
      repo.findUsers.mockResolvedValue(buildPaginatedResult([]));

      const result = await service.listUsers({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findUsers.mockRejectedValue(new Error('DB down'));

      await expect(service.listUsers({})).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── getUserDetail ─────────────────────────────────────────────────────────

  describe('getUserDetail', () => {
    it('returns user detail when found', async () => {
      const expected = buildUserDetail();
      repo.findUserById.mockResolvedValue(expected);

      const result = await service.getUserDetail(USER_ID);

      expect(result).toEqual(expected);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findUserById.mockResolvedValue(null);

      await expect(service.getUserDetail(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── suspendUser ───────────────────────────────────────────────────────────

  describe('suspendUser', () => {
    it('suspends an active user and creates an audit log', async () => {
      repo.findUserById.mockResolvedValue(buildUserDetail({ suspendedAt: null }));
      repo.updateUserSuspension.mockResolvedValue(undefined);
      repo.createAuditLog.mockResolvedValue(buildAuditLog({ action: 'user.suspend' }));

      await service.suspendUser(USER_ID, ADMIN_ID);

      expect(repo.updateUserSuspension).toHaveBeenCalledWith(
        USER_ID,
        expect.any(Date),
      );
      expect(repo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.suspend', resourceId: USER_ID }),
      );
    });

    it('throws BadRequestException when user is already suspended', async () => {
      repo.findUserById.mockResolvedValue(
        buildUserDetail({ suspendedAt: new Date('2026-01-01') }),
      );

      await expect(service.suspendUser(USER_ID, ADMIN_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.updateUserSuspension).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findUserById.mockResolvedValue(null);

      await expect(service.suspendUser(USER_ID, ADMIN_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── activateUser ──────────────────────────────────────────────────────────

  describe('activateUser', () => {
    it('activates a suspended user and creates an audit log', async () => {
      const suspendedAt = new Date('2026-01-01');
      repo.findUserById.mockResolvedValue(buildUserDetail({ suspendedAt }));
      repo.updateUserSuspension.mockResolvedValue(undefined);
      repo.createAuditLog.mockResolvedValue(buildAuditLog({ action: 'user.activate' }));

      await service.activateUser(USER_ID, ADMIN_ID);

      expect(repo.updateUserSuspension).toHaveBeenCalledWith(USER_ID, null);
      expect(repo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.activate', resourceId: USER_ID }),
      );
    });

    it('throws BadRequestException when user is already active', async () => {
      repo.findUserById.mockResolvedValue(buildUserDetail({ suspendedAt: null }));

      await expect(service.activateUser(USER_ID, ADMIN_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.updateUserSuspension).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findUserById.mockResolvedValue(null);

      await expect(service.activateUser(USER_ID, ADMIN_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── listOrganizations ─────────────────────────────────────────────────────

  describe('listOrganizations', () => {
    it('returns paginated org list with defaults applied', async () => {
      const expected = buildPaginatedResult([buildOrgListItem()]);
      repo.findOrganizations.mockResolvedValue(expected);

      const result = await service.listOrganizations({});

      expect(result).toEqual(expected);
      expect(repo.findOrganizations).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('forwards ownerId filter to repository', async () => {
      repo.findOrganizations.mockResolvedValue(buildPaginatedResult([]));

      await service.listOrganizations({ ownerId: USER_ID });

      expect(repo.findOrganizations).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: USER_ID }),
      );
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findOrganizations.mockRejectedValue(new Error('timeout'));

      await expect(service.listOrganizations({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── getOrganizationDetail ─────────────────────────────────────────────────

  describe('getOrganizationDetail', () => {
    it('returns org detail when found', async () => {
      const expected = buildOrgDetail();
      repo.findOrganizationById.mockResolvedValue(expected);

      const result = await service.getOrganizationDetail(ORG_ID);

      expect(result).toEqual(expected);
    });

    it('throws NotFoundException when organization does not exist', async () => {
      repo.findOrganizationById.mockResolvedValue(null);

      await expect(service.getOrganizationDetail(ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── listListings ──────────────────────────────────────────────────────────

  describe('listListings', () => {
    it('returns paginated listing list with defaults applied', async () => {
      const expected = buildPaginatedResult([buildListingListItem()]);
      repo.findListings.mockResolvedValue(expected);

      const result = await service.listListings({});

      expect(result).toEqual(expected);
      expect(repo.findListings).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('forwards status and listingType filters to repository', async () => {
      repo.findListings.mockResolvedValue(buildPaginatedResult([]));

      await service.listListings({ status: 'published', listingType: 'residential_let' });

      expect(repo.findListings).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published', listingType: 'residential_let' }),
      );
    });
  });

  // ── getListingDetail ──────────────────────────────────────────────────────

  describe('getListingDetail', () => {
    it('returns listing detail when found', async () => {
      const expected = buildListingDetail();
      repo.findListingById.mockResolvedValue(expected);

      const result = await service.getListingDetail(LISTING_ID);

      expect(result).toEqual(expected);
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findListingById.mockResolvedValue(null);

      await expect(service.getListingDetail(LISTING_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateListingStatus ───────────────────────────────────────────────────

  describe('updateListingStatus', () => {
    it('updates listing status and creates an audit log', async () => {
      repo.findListingById.mockResolvedValue(buildListingDetail({ status: 'draft' }));
      repo.updateListingStatus.mockResolvedValue(undefined);
      repo.createAuditLog.mockResolvedValue(
        buildAuditLog({ action: 'listing.status_change' }),
      );

      await service.updateListingStatus(LISTING_ID, 'published', ADMIN_ID);

      expect(repo.updateListingStatus).toHaveBeenCalledWith(LISTING_ID, 'published');
      expect(repo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'listing.status_change',
          metadata: { from: 'draft', to: 'published' },
        }),
      );
    });

    it('throws BadRequestException when status is unchanged', async () => {
      repo.findListingById.mockResolvedValue(buildListingDetail({ status: 'published' }));

      await expect(
        service.updateListingStatus(LISTING_ID, 'published', ADMIN_ID),
      ).rejects.toThrow(BadRequestException);
      expect(repo.updateListingStatus).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findListingById.mockResolvedValue(null);

      await expect(
        service.updateListingStatus(LISTING_ID, 'published', ADMIN_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingById.mockResolvedValue(buildListingDetail({ status: 'draft' }));
      repo.updateListingStatus.mockRejectedValue(new Error('DB error'));

      await expect(
        service.updateListingStatus(LISTING_ID, 'published', ADMIN_ID),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── listAuditLogs ─────────────────────────────────────────────────────────

  describe('listAuditLogs', () => {
    it('returns paginated audit logs with defaults applied', async () => {
      const expected = buildPaginatedResult([buildAuditLog()]);
      repo.findAuditLogs.mockResolvedValue(expected);

      const result = await service.listAuditLogs({});

      expect(result).toEqual(expected);
      expect(repo.findAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('forwards all filters to repository', async () => {
      repo.findAuditLogs.mockResolvedValue(buildPaginatedResult([]));

      await service.listAuditLogs({
        adminId: ADMIN_ID,
        resourceType: 'user',
        action: 'user.suspend',
      });

      expect(repo.findAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: ADMIN_ID,
          resourceType: 'user',
          action: 'user.suspend',
        }),
      );
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAuditLogs.mockRejectedValue(new Error('timeout'));

      await expect(service.listAuditLogs({})).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── getPlatformActivity ───────────────────────────────────────────────────

  describe('getPlatformActivity', () => {
    it('returns platform activity summary', async () => {
      const expected = buildPlatformActivity();
      repo.getPlatformActivity.mockResolvedValue(expected);

      const result = await service.getPlatformActivity();

      expect(result.users.total).toBe(10);
      expect(result.users.active).toBe(8);
      expect(result.listings.total).toBe(15);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.getPlatformActivity.mockRejectedValue(new Error('timeout'));

      await expect(service.getPlatformActivity()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
