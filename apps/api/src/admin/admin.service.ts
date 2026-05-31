import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ADMIN_REPOSITORY, type IAdminRepository } from './interfaces/admin-repository.interface';
import type {
  AdminAuditLog,
  AdminAuditLogFilters,
  AdminListingDetail,
  AdminListingFilters,
  AdminListingListItem,
  AdminOrgDetail,
  AdminOrgFilters,
  AdminOrgListItem,
  AdminPlatformActivity,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserListItem,
  PaginatedAdminResult,
} from './domain/admin';
import type { ListingStatus } from '../listings/domain/listing';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repo: IAdminRepository,
  ) {}

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(
    filters: Partial<AdminUserFilters>,
  ): Promise<PaginatedAdminResult<AdminUserListItem>> {
    try {
      return await this.repo.findUsers({
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async getUserDetail(id: string): Promise<AdminUserDetail> {
    try {
      const user = await this.repo.findUserById(id);
      if (!user) throw new NotFoundException(`User ${id} not found`);
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async suspendUser(userId: string, adminId: string): Promise<void> {
    const user = await this.getUserDetail(userId);

    if (user.suspendedAt !== null) {
      throw new BadRequestException('User is already suspended');
    }

    try {
      const suspendedAt = new Date();
      await this.repo.updateUserSuspension(userId, suspendedAt);
      await this.repo.createAuditLog({
        adminId,
        action: 'user.suspend',
        resourceType: 'user',
        resourceId: userId,
        metadata: { suspendedAt: suspendedAt.toISOString() },
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to suspend user');
    }
  }

  async activateUser(userId: string, adminId: string): Promise<void> {
    const user = await this.getUserDetail(userId);

    if (user.suspendedAt === null) {
      throw new BadRequestException('User is already active');
    }

    try {
      await this.repo.updateUserSuspension(userId, null);
      await this.repo.createAuditLog({
        adminId,
        action: 'user.activate',
        resourceType: 'user',
        resourceId: userId,
        metadata: { previousSuspendedAt: user.suspendedAt.toISOString() },
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to activate user');
    }
  }

  // ── Organizations ─────────────────────────────────────────────────────────

  async listOrganizations(
    filters: Partial<AdminOrgFilters>,
  ): Promise<PaginatedAdminResult<AdminOrgListItem>> {
    try {
      return await this.repo.findOrganizations({
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organizations');
    }
  }

  async getOrganizationDetail(id: string): Promise<AdminOrgDetail> {
    try {
      const org = await this.repo.findOrganizationById(id);
      if (!org) throw new NotFoundException(`Organization ${id} not found`);
      return org;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organization');
    }
  }

  // ── Listings ──────────────────────────────────────────────────────────────

  async listListings(
    filters: Partial<AdminListingFilters>,
  ): Promise<PaginatedAdminResult<AdminListingListItem>> {
    try {
      return await this.repo.findListings({
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listings');
    }
  }

  async getListingDetail(id: string): Promise<AdminListingDetail> {
    try {
      const listing = await this.repo.findListingById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);
      return listing;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listing');
    }
  }

  async updateListingStatus(
    listingId: string,
    status: ListingStatus,
    adminId: string,
  ): Promise<void> {
    const listing = await this.getListingDetail(listingId);

    if (listing.status === status) {
      throw new BadRequestException(
        `Listing is already in status '${status}'`,
      );
    }

    try {
      await this.repo.updateListingStatus(listingId, status);
      await this.repo.createAuditLog({
        adminId,
        action: 'listing.status_change',
        resourceType: 'listing',
        resourceId: listingId,
        metadata: { from: listing.status, to: status },
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to update listing status');
    }
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  async listAuditLogs(
    filters: Partial<AdminAuditLogFilters>,
  ): Promise<PaginatedAdminResult<AdminAuditLog>> {
    try {
      return await this.repo.findAuditLogs({
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve audit logs');
    }
  }

  // ── Activity ──────────────────────────────────────────────────────────────

  async getPlatformActivity(): Promise<AdminPlatformActivity> {
    try {
      return await this.repo.getPlatformActivity();
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve platform activity');
    }
  }
}
