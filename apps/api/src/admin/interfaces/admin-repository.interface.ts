import type {
  AdminAuditLog,
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
  AdminAuditLogFilters,
  CreateAuditLogData,
  PaginatedAdminResult,
} from '../domain/admin';
import type { ListingStatus } from '../../listings/domain/listing';

export interface IAdminRepository {
  // Users
  findUsers(filters: AdminUserFilters): Promise<PaginatedAdminResult<AdminUserListItem>>;
  findUserById(id: string): Promise<AdminUserDetail | null>;
  updateUserSuspension(id: string, suspendedAt: Date | null): Promise<void>;

  // Organizations
  findOrganizations(filters: AdminOrgFilters): Promise<PaginatedAdminResult<AdminOrgListItem>>;
  findOrganizationById(id: string): Promise<AdminOrgDetail | null>;

  // Listings
  findListings(filters: AdminListingFilters): Promise<PaginatedAdminResult<AdminListingListItem>>;
  findListingById(id: string): Promise<AdminListingDetail | null>;
  updateListingStatus(id: string, status: ListingStatus): Promise<void>;

  // Audit logs
  createAuditLog(data: CreateAuditLogData): Promise<AdminAuditLog>;
  findAuditLogs(filters: AdminAuditLogFilters): Promise<PaginatedAdminResult<AdminAuditLog>>;

  // Activity
  getPlatformActivity(): Promise<AdminPlatformActivity>;
}

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');
