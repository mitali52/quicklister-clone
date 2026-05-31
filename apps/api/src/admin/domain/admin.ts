import type { ListingStatus, ListingType, PropertyType } from '../../listings/domain/listing';

// ── User types ────────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  emailVerified: boolean;
  createdAt: Date;
  suspendedAt: Date | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  phoneNumber: string | null;
  avatarUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  nrlaMember: boolean;
  updatedAt: Date;
  listingCount: number;
  organizationCount: number;
}

// ── Organization types ────────────────────────────────────────────────────────

export interface AdminOrgListItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  slug: string;
  listingCount: number;
  createdAt: Date;
}

export interface AdminOrgDetail extends AdminOrgListItem {
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  updatedAt: Date;
}

// ── Listing types ─────────────────────────────────────────────────────────────

export interface AdminListingListItem {
  id: string;
  userId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: ListingStatus;
  city: string;
  postcode: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminListingDetail extends AdminListingListItem {
  description: string | null;
  addressLine1: string;
  addressLine2: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  deletedAt: Date | null;
  mediaCount: number;
}

// ── Audit log types ───────────────────────────────────────────────────────────

export type AuditAction =
  | 'user.suspend'
  | 'user.activate'
  | 'listing.status_change';

export type AuditResourceType = 'user' | 'listing' | 'organization';

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateAuditLogData {
  adminId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  metadata: Record<string, unknown>;
}

// ── Activity summary ──────────────────────────────────────────────────────────

export interface AdminPlatformActivity {
  users: { total: number; active: number; suspended: number };
  organizations: { total: number };
  listings: { total: number; byStatus: Partial<Record<ListingStatus, number>> };
  recentAuditLogs: AdminAuditLog[];
}

// ── Filter types ──────────────────────────────────────────────────────────────

export interface AdminUserFilters {
  search?: string;
  roleName?: string;
  suspended?: boolean;
  page: number;
  limit: number;
}

export interface AdminOrgFilters {
  search?: string;
  ownerId?: string;
  page: number;
  limit: number;
}

export interface AdminListingFilters {
  search?: string;
  status?: ListingStatus;
  listingType?: ListingType;
  userId?: string;
  page: number;
  limit: number;
}

export interface AdminAuditLogFilters {
  adminId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  page: number;
  limit: number;
}

// ── Paginated result ──────────────────────────────────────────────────────────

export interface PaginatedAdminResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
