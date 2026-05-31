import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type { ListingStatus, ListingType, PropertyType } from '../listings/domain/listing';
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
  CreateAuditLogData,
  PaginatedAdminResult,
} from './domain/admin';
import type { IAdminRepository } from './interfaces/admin-repository.interface';

// ── Row shapes ────────────────────────────────────────────────────────────────

interface UserListRow {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
  email_verified: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

interface UserDetailRow extends UserListRow {
  phone_number: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  nrla_member: boolean;
  updated_at: Date;
  listing_count: string;
  organization_count: string;
}

interface OrgListRow {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  name: string;
  slug: string;
  listing_count: string;
  created_at: Date;
}

interface OrgDetailRow extends OrgListRow {
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  updated_at: Date;
}

interface ListingListRow {
  id: string;
  user_id: string;
  owner_name: string;
  owner_email: string;
  title: string;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  city: string;
  postcode: string;
  asking_price: number | null;
  monthly_rent: number | null;
  created_at: Date;
  updated_at: Date;
}

interface ListingDetailRow extends ListingListRow {
  description: string | null;
  address_line1: string;
  address_line2: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  deleted_at: Date | null;
  media_count: string;
}

interface AuditLogRow {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

interface CountRow {
  total: string;
}

interface StatusCountRow {
  status: ListingStatus;
  cnt: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function userListToDomain(row: UserListRow): AdminUserListItem {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    roleName: row.role_name,
    emailVerified: row.email_verified,
    createdAt: row.created_at,
    suspendedAt: row.deleted_at,
  };
}

function userDetailToDomain(row: UserDetailRow): AdminUserDetail {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    roleName: row.role_name,
    emailVerified: row.email_verified,
    createdAt: row.created_at,
    suspendedAt: row.deleted_at,
    phoneNumber: row.phone_number,
    avatarUrl: row.avatar_url,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    county: row.county,
    postcode: row.postcode,
    nrlaMember: row.nrla_member,
    updatedAt: row.updated_at,
    listingCount: parseInt(row.listing_count, 10),
    organizationCount: parseInt(row.organization_count, 10),
  };
}

function orgListToDomain(row: OrgListRow): AdminOrgListItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    name: row.name,
    slug: row.slug,
    listingCount: parseInt(row.listing_count, 10),
    createdAt: row.created_at,
  };
}

function orgDetailToDomain(row: OrgDetailRow): AdminOrgDetail {
  return {
    ...orgListToDomain(row),
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    updatedAt: row.updated_at,
  };
}

function listingListToDomain(row: ListingListRow): AdminListingListItem {
  return {
    id: row.id,
    userId: row.user_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    title: row.title,
    listingType: row.listing_type,
    propertyType: row.property_type,
    status: row.status,
    city: row.city,
    postcode: row.postcode,
    askingPrice: row.asking_price,
    monthlyRent: row.monthly_rent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function listingDetailToDomain(row: ListingDetailRow): AdminListingDetail {
  return {
    ...listingListToDomain(row),
    description: row.description,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    deletedAt: row.deleted_at,
    mediaCount: parseInt(row.media_count, 10),
  };
}

function auditLogToDomain(row: AuditLogRow): AdminAuditLog {
  return {
    id: row.id,
    adminId: row.admin_id,
    adminName: row.admin_name,
    adminEmail: row.admin_email,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

// ── Query builder helpers ─────────────────────────────────────────────────────

interface BuiltConditions {
  where: string;
  params: unknown[];
}

function buildConditions(
  conditions: string[],
  params: unknown[],
): BuiltConditions {
  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  // ── Users ─────────────────────────────────────────────────────────────────

  async findUsers(filters: AdminUserFilters): Promise<PaginatedAdminResult<AdminUserListItem>> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.search !== undefined) {
      params.push(`%${filters.search}%`);
      conditions.push(`(u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }
    if (filters.roleName !== undefined) {
      params.push(filters.roleName);
      conditions.push(`r.name = $${params.length}`);
    }
    if (filters.suspended === true) {
      conditions.push('u.deleted_at IS NOT NULL');
    } else if (filters.suspended === false) {
      conditions.push('u.deleted_at IS NULL');
    }

    const { where, params: condParams } = buildConditions(conditions, params);

    try {
      const selectParams = [...condParams, filters.limit, offset];
      const countParams = [...condParams];

      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<UserListRow>(
          `
          SELECT u.id, u.email, u.full_name, u.email_verified, u.created_at, u.deleted_at,
                 r.name AS role_name
          FROM users u
          INNER JOIN roles r ON r.id = u.role_id
          ${where}
          ORDER BY u.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `
          SELECT COUNT(*) AS total
          FROM users u
          INNER JOIN roles r ON r.id = u.role_id
          ${where}
          `,
          countParams,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(userListToDomain),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (err) {
      handleDbError(err, 'AdminRepository.findUsers');
    }
  }

  async findUserById(id: string): Promise<AdminUserDetail | null> {
    try {
      const result = await this.pool.query<UserDetailRow>(
        `
        SELECT
          u.id, u.email, u.full_name, u.email_verified, u.created_at, u.updated_at,
          u.deleted_at, u.phone_number, u.avatar_url, u.address_line1, u.address_line2,
          u.city, u.county, u.postcode, u.nrla_member,
          r.name AS role_name,
          (SELECT COUNT(*) FROM listings l
            WHERE l.user_id = u.id AND l.deleted_at IS NULL) AS listing_count,
          (SELECT COUNT(*) FROM organizations o
            WHERE o.owner_id = u.id AND o.deleted_at IS NULL) AS organization_count
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1
        `,
        [id],
      );
      const row = result.rows[0];
      return row ? userDetailToDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'AdminRepository.findUserById');
    }
  }

  async updateUserSuspension(id: string, suspendedAt: Date | null): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE users SET deleted_at = $1, updated_at = NOW() WHERE id = $2',
        [suspendedAt, id],
      );
    } catch (err) {
      handleDbError(err, 'AdminRepository.updateUserSuspension');
    }
  }

  // ── Organizations ─────────────────────────────────────────────────────────

  async findOrganizations(
    filters: AdminOrgFilters,
  ): Promise<PaginatedAdminResult<AdminOrgListItem>> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = ['o.deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filters.search !== undefined) {
      params.push(`%${filters.search}%`);
      conditions.push(`(o.name ILIKE $${params.length} OR o.slug ILIKE $${params.length})`);
    }
    if (filters.ownerId !== undefined) {
      params.push(filters.ownerId);
      conditions.push(`o.owner_id = $${params.length}`);
    }

    const { where, params: condParams } = buildConditions(conditions, params);

    try {
      const selectParams = [...condParams, filters.limit, offset];

      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<OrgListRow>(
          `
          SELECT
            o.id, o.owner_id, o.name, o.slug, o.created_at,
            u.full_name AS owner_name,
            u.email     AS owner_email,
            (SELECT COUNT(*) FROM listings l
              WHERE l.user_id = o.owner_id AND l.deleted_at IS NULL) AS listing_count
          FROM organizations o
          INNER JOIN users u ON u.id = o.owner_id
          ${where}
          ORDER BY o.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `
          SELECT COUNT(*) AS total
          FROM organizations o
          INNER JOIN users u ON u.id = o.owner_id
          ${where}
          `,
          condParams,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(orgListToDomain),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (err) {
      handleDbError(err, 'AdminRepository.findOrganizations');
    }
  }

  async findOrganizationById(id: string): Promise<AdminOrgDetail | null> {
    try {
      const result = await this.pool.query<OrgDetailRow>(
        `
        SELECT
          o.id, o.owner_id, o.name, o.slug, o.description, o.logo_url, o.website_url,
          o.created_at, o.updated_at,
          u.full_name AS owner_name,
          u.email     AS owner_email,
          (SELECT COUNT(*) FROM listings l
            WHERE l.user_id = o.owner_id AND l.deleted_at IS NULL) AS listing_count
        FROM organizations o
        INNER JOIN users u ON u.id = o.owner_id
        WHERE o.id = $1 AND o.deleted_at IS NULL
        `,
        [id],
      );
      const row = result.rows[0];
      return row ? orgDetailToDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'AdminRepository.findOrganizationById');
    }
  }

  // ── Listings ──────────────────────────────────────────────────────────────

  async findListings(
    filters: AdminListingFilters,
  ): Promise<PaginatedAdminResult<AdminListingListItem>> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = ['l.deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filters.search !== undefined) {
      params.push(`%${filters.search}%`);
      conditions.push(
        `(l.title ILIKE $${params.length} OR l.city ILIKE $${params.length} OR l.postcode ILIKE $${params.length})`,
      );
    }
    if (filters.status !== undefined) {
      params.push(filters.status);
      conditions.push(`l.status = $${params.length}`);
    }
    if (filters.listingType !== undefined) {
      params.push(filters.listingType);
      conditions.push(`l.listing_type = $${params.length}`);
    }
    if (filters.userId !== undefined) {
      params.push(filters.userId);
      conditions.push(`l.user_id = $${params.length}`);
    }

    const { where, params: condParams } = buildConditions(conditions, params);

    try {
      const selectParams = [...condParams, filters.limit, offset];

      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<ListingListRow>(
          `
          SELECT
            l.id, l.user_id, l.title, l.listing_type, l.property_type, l.status,
            l.asking_price, l.monthly_rent, l.city, l.postcode, l.created_at, l.updated_at,
            u.full_name AS owner_name,
            u.email     AS owner_email
          FROM listings l
          INNER JOIN users u ON u.id = l.user_id
          ${where}
          ORDER BY l.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `
          SELECT COUNT(*) AS total
          FROM listings l
          INNER JOIN users u ON u.id = l.user_id
          ${where}
          `,
          condParams,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(listingListToDomain),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (err) {
      handleDbError(err, 'AdminRepository.findListings');
    }
  }

  async findListingById(id: string): Promise<AdminListingDetail | null> {
    try {
      const result = await this.pool.query<ListingDetailRow>(
        `
        SELECT
          l.id, l.user_id, l.title, l.description, l.listing_type, l.property_type, l.status,
          l.asking_price, l.monthly_rent, l.address_line1, l.address_line2,
          l.city, l.postcode, l.bedrooms, l.bathrooms, l.created_at, l.updated_at, l.deleted_at,
          u.full_name AS owner_name,
          u.email     AS owner_email,
          (SELECT COUNT(*) FROM listing_media lm WHERE lm.listing_id = l.id) AS media_count
        FROM listings l
        INNER JOIN users u ON u.id = l.user_id
        WHERE l.id = $1
        `,
        [id],
      );
      const row = result.rows[0];
      return row ? listingDetailToDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'AdminRepository.findListingById');
    }
  }

  async updateListingStatus(id: string, status: ListingStatus): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE listings SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
        [status, id],
      );
    } catch (err) {
      handleDbError(err, 'AdminRepository.updateListingStatus');
    }
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  async createAuditLog(data: CreateAuditLogData): Promise<AdminAuditLog> {
    try {
      const result = await this.pool.query<AuditLogRow>(
        `
        INSERT INTO admin_audit_logs (admin_id, action, resource_type, resource_id, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id, admin_id, action, resource_type, resource_id, metadata, created_at,
          (SELECT full_name FROM users WHERE id = $1) AS admin_name,
          (SELECT email       FROM users WHERE id = $1) AS admin_email
        `,
        [
          data.adminId,
          data.action,
          data.resourceType,
          data.resourceId,
          JSON.stringify(data.metadata),
        ],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Audit log insert returned no row');
      return auditLogToDomain(row);
    } catch (err) {
      handleDbError(err, 'AdminRepository.createAuditLog');
    }
  }

  async findAuditLogs(
    filters: AdminAuditLogFilters,
  ): Promise<PaginatedAdminResult<AdminAuditLog>> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.adminId !== undefined) {
      params.push(filters.adminId);
      conditions.push(`a.admin_id = $${params.length}`);
    }
    if (filters.resourceType !== undefined) {
      params.push(filters.resourceType);
      conditions.push(`a.resource_type = $${params.length}`);
    }
    if (filters.resourceId !== undefined) {
      params.push(filters.resourceId);
      conditions.push(`a.resource_id = $${params.length}`);
    }
    if (filters.action !== undefined) {
      params.push(filters.action);
      conditions.push(`a.action = $${params.length}`);
    }

    const { where, params: condParams } = buildConditions(conditions, params);

    try {
      const selectParams = [...condParams, filters.limit, offset];

      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<AuditLogRow>(
          `
          SELECT
            a.id, a.admin_id, a.action, a.resource_type, a.resource_id, a.metadata, a.created_at,
            u.full_name AS admin_name,
            u.email     AS admin_email
          FROM admin_audit_logs a
          INNER JOIN users u ON u.id = a.admin_id
          ${where}
          ORDER BY a.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `
          SELECT COUNT(*) AS total
          FROM admin_audit_logs a
          ${where}
          `,
          condParams,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(auditLogToDomain),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (err) {
      handleDbError(err, 'AdminRepository.findAuditLogs');
    }
  }

  // ── Activity ──────────────────────────────────────────────────────────────

  async getPlatformActivity(): Promise<AdminPlatformActivity> {
    try {
      const [userStats, orgStats, listingStats, recentLogs] = await Promise.all([
        this.pool.query<{ total: string; active: string; suspended: string }>(
          `
          SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE deleted_at IS NULL)     AS active,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS suspended
          FROM users
          `,
        ),
        this.pool.query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM organizations WHERE deleted_at IS NULL`,
        ),
        this.pool.query<StatusCountRow>(
          `
          SELECT status, COUNT(*) AS cnt
          FROM listings
          WHERE deleted_at IS NULL
          GROUP BY status
          `,
        ),
        this.pool.query<AuditLogRow>(
          `
          SELECT
            a.id, a.admin_id, a.action, a.resource_type, a.resource_id, a.metadata, a.created_at,
            u.full_name AS admin_name,
            u.email     AS admin_email
          FROM admin_audit_logs a
          INNER JOIN users u ON u.id = a.admin_id
          ORDER BY a.created_at DESC
          LIMIT 10
          `,
        ),
      ]);

      const userRow = userStats.rows[0];
      const orgRow = orgStats.rows[0];

      const byStatus: Partial<Record<ListingStatus, number>> = {};
      let listingTotal = 0;
      for (const row of listingStats.rows) {
        const cnt = parseInt(row.cnt, 10);
        byStatus[row.status] = cnt;
        listingTotal += cnt;
      }

      return {
        users: {
          total: parseInt(userRow?.total ?? '0', 10),
          active: parseInt(userRow?.active ?? '0', 10),
          suspended: parseInt(userRow?.suspended ?? '0', 10),
        },
        organizations: {
          total: parseInt(orgRow?.total ?? '0', 10),
        },
        listings: {
          total: listingTotal,
          byStatus,
        },
        recentAuditLogs: recentLogs.rows.map(auditLogToDomain),
      };
    } catch (err) {
      handleDbError(err, 'AdminRepository.getPlatformActivity');
    }
  }
}
