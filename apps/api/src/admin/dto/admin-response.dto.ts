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
} from '../domain/admin';
import type { ListingStatus } from '../../listings/domain/listing';

// ── Pagination meta ───────────────────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── User DTOs ─────────────────────────────────────────────────────────────────

export class AdminUserListItemDto {
  id!: string;
  email!: string;
  fullName!: string;
  roleName!: string;
  emailVerified!: boolean;
  createdAt!: Date;
  suspended!: boolean;
  suspendedAt!: Date | null;

  static fromDomain(u: AdminUserListItem): AdminUserListItemDto {
    const dto = new AdminUserListItemDto();
    dto.id = u.id;
    dto.email = u.email;
    dto.fullName = u.fullName;
    dto.roleName = u.roleName;
    dto.emailVerified = u.emailVerified;
    dto.createdAt = u.createdAt;
    dto.suspended = u.suspendedAt !== null;
    dto.suspendedAt = u.suspendedAt;
    return dto;
  }
}

export class AdminUserDetailDto extends AdminUserListItemDto {
  phoneNumber!: string | null;
  avatarUrl!: string | null;
  addressLine1!: string | null;
  addressLine2!: string | null;
  city!: string | null;
  county!: string | null;
  postcode!: string | null;
  nrlaMember!: boolean;
  updatedAt!: Date;
  listingCount!: number;
  organizationCount!: number;

  static fromDomain(u: AdminUserDetail): AdminUserDetailDto {
    const dto = new AdminUserDetailDto();
    dto.id = u.id;
    dto.email = u.email;
    dto.fullName = u.fullName;
    dto.roleName = u.roleName;
    dto.emailVerified = u.emailVerified;
    dto.createdAt = u.createdAt;
    dto.suspended = u.suspendedAt !== null;
    dto.suspendedAt = u.suspendedAt;
    dto.phoneNumber = u.phoneNumber;
    dto.avatarUrl = u.avatarUrl;
    dto.addressLine1 = u.addressLine1;
    dto.addressLine2 = u.addressLine2;
    dto.city = u.city;
    dto.county = u.county;
    dto.postcode = u.postcode;
    dto.nrlaMember = u.nrlaMember;
    dto.updatedAt = u.updatedAt;
    dto.listingCount = u.listingCount;
    dto.organizationCount = u.organizationCount;
    return dto;
  }
}

export class AdminUserListResponseDto {
  data!: AdminUserListItemDto[];
  meta!: PaginationMeta;

  static fromDomain(result: PaginatedAdminResult<AdminUserListItem>): AdminUserListResponseDto {
    const dto = new AdminUserListResponseDto();
    dto.data = result.items.map((u) => AdminUserListItemDto.fromDomain(u));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}

// ── Organization DTOs ─────────────────────────────────────────────────────────

export class AdminOrgListItemDto {
  id!: string;
  ownerId!: string;
  ownerName!: string;
  ownerEmail!: string;
  name!: string;
  slug!: string;
  listingCount!: number;
  createdAt!: Date;

  static fromDomain(o: AdminOrgListItem): AdminOrgListItemDto {
    const dto = new AdminOrgListItemDto();
    dto.id = o.id;
    dto.ownerId = o.ownerId;
    dto.ownerName = o.ownerName;
    dto.ownerEmail = o.ownerEmail;
    dto.name = o.name;
    dto.slug = o.slug;
    dto.listingCount = o.listingCount;
    dto.createdAt = o.createdAt;
    return dto;
  }
}

export class AdminOrgDetailDto extends AdminOrgListItemDto {
  description!: string | null;
  logoUrl!: string | null;
  websiteUrl!: string | null;
  updatedAt!: Date;

  static fromDomain(o: AdminOrgDetail): AdminOrgDetailDto {
    const dto = new AdminOrgDetailDto();
    dto.id = o.id;
    dto.ownerId = o.ownerId;
    dto.ownerName = o.ownerName;
    dto.ownerEmail = o.ownerEmail;
    dto.name = o.name;
    dto.slug = o.slug;
    dto.listingCount = o.listingCount;
    dto.createdAt = o.createdAt;
    dto.description = o.description;
    dto.logoUrl = o.logoUrl;
    dto.websiteUrl = o.websiteUrl;
    dto.updatedAt = o.updatedAt;
    return dto;
  }
}

export class AdminOrgListResponseDto {
  data!: AdminOrgListItemDto[];
  meta!: PaginationMeta;

  static fromDomain(
    result: PaginatedAdminResult<AdminOrgListItem>,
  ): AdminOrgListResponseDto {
    const dto = new AdminOrgListResponseDto();
    dto.data = result.items.map((o) => AdminOrgListItemDto.fromDomain(o));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}

// ── Listing DTOs ──────────────────────────────────────────────────────────────

export class AdminListingListItemDto {
  id!: string;
  userId!: string;
  ownerName!: string;
  ownerEmail!: string;
  title!: string;
  listingType!: string;
  propertyType!: string;
  status!: ListingStatus;
  city!: string;
  postcode!: string;
  askingPrice!: number | null;
  monthlyRent!: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(l: AdminListingListItem): AdminListingListItemDto {
    const dto = new AdminListingListItemDto();
    dto.id = l.id;
    dto.userId = l.userId;
    dto.ownerName = l.ownerName;
    dto.ownerEmail = l.ownerEmail;
    dto.title = l.title;
    dto.listingType = l.listingType;
    dto.propertyType = l.propertyType;
    dto.status = l.status;
    dto.city = l.city;
    dto.postcode = l.postcode;
    dto.askingPrice = l.askingPrice;
    dto.monthlyRent = l.monthlyRent;
    dto.createdAt = l.createdAt;
    dto.updatedAt = l.updatedAt;
    return dto;
  }
}

export class AdminListingDetailDto extends AdminListingListItemDto {
  description!: string | null;
  addressLine1!: string;
  addressLine2!: string | null;
  bedrooms!: number | null;
  bathrooms!: number | null;
  deletedAt!: Date | null;
  mediaCount!: number;

  static fromDomain(l: AdminListingDetail): AdminListingDetailDto {
    const dto = new AdminListingDetailDto();
    dto.id = l.id;
    dto.userId = l.userId;
    dto.ownerName = l.ownerName;
    dto.ownerEmail = l.ownerEmail;
    dto.title = l.title;
    dto.listingType = l.listingType;
    dto.propertyType = l.propertyType;
    dto.status = l.status;
    dto.city = l.city;
    dto.postcode = l.postcode;
    dto.askingPrice = l.askingPrice;
    dto.monthlyRent = l.monthlyRent;
    dto.createdAt = l.createdAt;
    dto.updatedAt = l.updatedAt;
    dto.description = l.description;
    dto.addressLine1 = l.addressLine1;
    dto.addressLine2 = l.addressLine2;
    dto.bedrooms = l.bedrooms;
    dto.bathrooms = l.bathrooms;
    dto.deletedAt = l.deletedAt;
    dto.mediaCount = l.mediaCount;
    return dto;
  }
}

export class AdminListingListResponseDto {
  data!: AdminListingListItemDto[];
  meta!: PaginationMeta;

  static fromDomain(
    result: PaginatedAdminResult<AdminListingListItem>,
  ): AdminListingListResponseDto {
    const dto = new AdminListingListResponseDto();
    dto.data = result.items.map((l) => AdminListingListItemDto.fromDomain(l));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}

// ── Audit log DTOs ────────────────────────────────────────────────────────────

export class AdminAuditLogDto {
  id!: string;
  adminId!: string;
  adminName!: string;
  adminEmail!: string;
  action!: string;
  resourceType!: string;
  resourceId!: string;
  metadata!: Record<string, unknown>;
  createdAt!: Date;

  static fromDomain(a: AdminAuditLog): AdminAuditLogDto {
    const dto = new AdminAuditLogDto();
    dto.id = a.id;
    dto.adminId = a.adminId;
    dto.adminName = a.adminName;
    dto.adminEmail = a.adminEmail;
    dto.action = a.action;
    dto.resourceType = a.resourceType;
    dto.resourceId = a.resourceId;
    dto.metadata = a.metadata;
    dto.createdAt = a.createdAt;
    return dto;
  }
}

export class AdminAuditLogListResponseDto {
  data!: AdminAuditLogDto[];
  meta!: PaginationMeta;

  static fromDomain(
    result: PaginatedAdminResult<AdminAuditLog>,
  ): AdminAuditLogListResponseDto {
    const dto = new AdminAuditLogListResponseDto();
    dto.data = result.items.map((a) => AdminAuditLogDto.fromDomain(a));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}

// ── Activity DTO ──────────────────────────────────────────────────────────────

export class AdminPlatformActivityDto {
  users!: { total: number; active: number; suspended: number };
  organizations!: { total: number };
  listings!: { total: number; byStatus: Record<string, number> };
  recentAuditLogs!: AdminAuditLogDto[];

  static fromDomain(a: AdminPlatformActivity): AdminPlatformActivityDto {
    const dto = new AdminPlatformActivityDto();
    dto.users = a.users;
    dto.organizations = a.organizations;
    dto.listings = a.listings;
    dto.recentAuditLogs = a.recentAuditLogs.map((l) => AdminAuditLogDto.fromDomain(l));
    return dto;
  }
}
