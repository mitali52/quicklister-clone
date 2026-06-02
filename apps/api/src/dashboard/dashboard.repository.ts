import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type {
  IDashboardRepository,
  TodayReviewStats,
} from './interfaces/dashboard-repository.interface';
import type { User } from '../users/domain/user';
import type { Listing, ListingStatus, ListingType, PropertyType } from '../listings/domain/listing';
import type { ListingStats } from './domain/dashboard';
import type { PaginatedRecentReviews, RecentReview, ReviewDecision } from './domain/moderator-dashboard';
import type { AdminUserStats, AdminOrganizationStats, AdminSystemStats } from './domain/admin-dashboard';

// ── Row types ─────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  role_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  email_verified: boolean;
  nrla_member: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface ListingRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  asking_price: number | null;
  monthly_rent: number | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface ListingStatsRow {
  total: string;
  draft: string;
  pending_review: string;
  published: string;
  rejected: string;
}

interface CountRow {
  count: string;
}

interface PlatformUserStatsRow {
  total: string;
  active: string;
  blocked: string;
}

interface PlatformOrgsStatsRow {
  total: string;
  active: string;
}

interface SystemStatsRow {
  notifications_sent: string;
  audit_logs_generated: string;
}

interface TodayReviewStatsRow {
  approved_today: string;
  rejected_today: string;
}

interface RecentReviewRow {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_city: string;
  listing_postcode: string;
  decision: ReviewDecision;
  notes: string | null;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewed_at: Date;
  total_count: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function toUserDomain(row: UserRow): User {
  return {
    id: row.id,
    roleId: row.role_id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    avatarUrl: row.avatar_url,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    county: row.county,
    postcode: row.postcode,
    emailVerified: row.email_verified,
    nrlaMember: row.nrla_member,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function toListingDomain(row: ListingRow): Listing {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    listingType: row.listing_type,
    propertyType: row.property_type,
    status: row.status,
    askingPrice: row.asking_price,
    monthlyRent: row.monthly_rent,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function toListingStats(row: ListingStatsRow | undefined): ListingStats {
  return {
    totalListings: Number.parseInt(row?.total ?? '0', 10),
    draftListings: Number.parseInt(row?.draft ?? '0', 10),
    pendingListings: Number.parseInt(row?.pending_review ?? '0', 10),
    approvedListings: Number.parseInt(row?.published ?? '0', 10),
    rejectedListings: Number.parseInt(row?.rejected ?? '0', 10),
  };
}

function toRecentReview(row: RecentReviewRow): RecentReview {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingCity: row.listing_city,
    listingPostcode: row.listing_postcode,
    decision: row.decision,
    notes: row.notes,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    reviewerEmail: row.reviewer_email,
    reviewedAt: row.reviewed_at,
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const result = await this.pool.query<UserRow>(
        `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [userId],
      );
      const row = result.rows[0];
      return row ? toUserDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getUserProfile');
    }
  }

  async getListingStats(userId: string | null): Promise<ListingStats> {
    try {
      // Passing null uses IS NULL short-circuit → platform-wide stats.
      // Passing a userId scopes all counts to that user.
      const result = await this.pool.query<ListingStatsRow>(
        `SELECT
           COUNT(*)                                               AS total,
           COUNT(*) FILTER (WHERE l.status = 'draft')            AS draft,
           COUNT(*) FILTER (WHERE l.status = 'pending_review')   AS pending_review,
           COUNT(*) FILTER (WHERE l.status = 'published')        AS published,
           (
             SELECT COUNT(DISTINCT mr.listing_id)
             FROM moderation_reviews mr
             INNER JOIN listings l2 ON l2.id = mr.listing_id
             WHERE l2.deleted_at IS NULL
               AND mr.decision    = 'rejected'
               AND ($1::UUID IS NULL OR l2.user_id = $1)
           )                                                      AS rejected
         FROM listings l
         WHERE l.deleted_at IS NULL
           AND ($1::UUID IS NULL OR l.user_id = $1)`,
        [userId],
      );
      return toListingStats(result.rows[0]);
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getListingStats');
    }
  }

  async getRecentListings(userId: string, limit: number): Promise<Listing[]> {
    try {
      const result = await this.pool.query<ListingRow>(
        `SELECT * FROM listings
         WHERE user_id = $1 AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit],
      );
      return result.rows.map(toListingDomain);
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getRecentListings');
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const result = await this.pool.query<CountRow>(
        `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
        [userId],
      );
      return Number.parseInt(result.rows[0]?.count ?? '0', 10);
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getUnreadNotificationCount');
    }
  }

  async getPlatformUserStats(): Promise<AdminUserStats> {
    try {
      const result = await this.pool.query<PlatformUserStatsRow>(
        `SELECT
           COUNT(*)                                         AS total,
           COUNT(*) FILTER (WHERE deleted_at IS NULL)      AS active,
           COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)  AS blocked
         FROM users`,
      );
      return {
        totalUsers: Number.parseInt(result.rows[0]?.total ?? '0', 10),
        activeUsers: Number.parseInt(result.rows[0]?.active ?? '0', 10),
        blockedUsers: Number.parseInt(result.rows[0]?.blocked ?? '0', 10),
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getPlatformUserStats');
    }
  }

  async getPlatformOrganizationStats(): Promise<AdminOrganizationStats> {
    try {
      const result = await this.pool.query<PlatformOrgsStatsRow>(
        `SELECT
           COUNT(*)                                         AS total,
           COUNT(*) FILTER (WHERE deleted_at IS NULL)      AS active
         FROM organizations`,
      );
      return {
        totalOrganizations: Number.parseInt(result.rows[0]?.total ?? '0', 10),
        activeOrganizations: Number.parseInt(result.rows[0]?.active ?? '0', 10),
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getPlatformOrganizationStats');
    }
  }

  async getPlatformSystemStats(): Promise<AdminSystemStats> {
    try {
      const result = await this.pool.query<SystemStatsRow>(
        `SELECT
           (SELECT COUNT(*) FROM notifications) AS notifications_sent,
           (SELECT COUNT(*) FROM audit_logs)    AS audit_logs_generated`,
      );
      return {
        notificationsSent: Number.parseInt(result.rows[0]?.notifications_sent ?? '0', 10),
        auditLogsGenerated: Number.parseInt(result.rows[0]?.audit_logs_generated ?? '0', 10),
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getPlatformSystemStats');
    }
  }

  async getPendingReviewCount(): Promise<number> {
    try {
      const result = await this.pool.query<CountRow>(
        `SELECT COUNT(*) AS count
         FROM listings
         WHERE status = 'pending_review' AND deleted_at IS NULL`,
      );
      return Number.parseInt(result.rows[0]?.count ?? '0', 10);
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getPendingReviewCount');
    }
  }

  async getTodayReviewStats(): Promise<TodayReviewStats> {
    try {
      const result = await this.pool.query<TodayReviewStatsRow>(
        `SELECT
           COUNT(*) FILTER (WHERE decision = 'approved') AS approved_today,
           COUNT(*) FILTER (WHERE decision = 'rejected') AS rejected_today
         FROM moderation_reviews
         WHERE created_at >= CURRENT_DATE`,
      );
      return {
        approvedToday: Number.parseInt(result.rows[0]?.approved_today ?? '0', 10),
        rejectedToday: Number.parseInt(result.rows[0]?.rejected_today ?? '0', 10),
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getTodayReviewStats');
    }
  }

  async getRecentReviews(page: number, limit: number): Promise<PaginatedRecentReviews> {
    const offset = (page - 1) * limit;
    try {
      // COUNT(*) OVER() is a window function — returns total row count without a second query.
      const result = await this.pool.query<RecentReviewRow>(
        `SELECT
           mr.id,
           mr.listing_id,
           l.title            AS listing_title,
           l.city             AS listing_city,
           l.postcode         AS listing_postcode,
           mr.decision,
           mr.notes,
           mr.reviewer_id,
           u.full_name        AS reviewer_name,
           u.email            AS reviewer_email,
           mr.created_at      AS reviewed_at,
           COUNT(*) OVER()    AS total_count
         FROM moderation_reviews mr
         INNER JOIN listings l ON l.id = mr.listing_id
         INNER JOIN users   u ON u.id = mr.reviewer_id
         ORDER BY mr.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const total = Number.parseInt(result.rows[0]?.total_count ?? '0', 10);
      return {
        items: result.rows.map(toRecentReview),
        total,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getRecentReviews');
    }
  }
}
