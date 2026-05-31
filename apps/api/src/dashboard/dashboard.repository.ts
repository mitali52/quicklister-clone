import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { UserDashboard, ListingStats } from './domain/dashboard';
import type { User } from '../users/domain/user';
import type { Listing, ListingStatus, ListingType, PropertyType } from '../listings/domain/listing';

// ── Row types ────────────────────────────────────────────────────────────────

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

interface StatsRow {
  total: string;
  draft: string;
  pending_review: string;
  published: string;
  rejected: string;
}

interface CountRow {
  count: string;
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

function toStats(row: StatsRow | undefined): ListingStats {
  return {
    totalListings: Number.parseInt(row?.total ?? '0', 10),
    draftListings: Number.parseInt(row?.draft ?? '0', 10),
    pendingListings: Number.parseInt(row?.pending_review ?? '0', 10),
    approvedListings: Number.parseInt(row?.published ?? '0', 10),
    rejectedListings: Number.parseInt(row?.rejected ?? '0', 10),
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

const RECENT_LISTINGS_LIMIT = 5;

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getUserDashboard(userId: string): Promise<UserDashboard | null> {
    try {
      // All 4 queries run concurrently — zero N+1, single round-trip latency
      const [userResult, statsResult, listingsResult, notifResult] = await Promise.all([
        // 1. User profile
        this.pool.query<UserRow>(
          `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
          [userId],
        ),

        // 2. Listing stats: all status counts + rejected-by-moderation count in one query.
        //    "rejected" = listings that have at least one rejected moderation review.
        //    Rejected listings revert to 'draft', so we track them via the review table.
        this.pool.query<StatsRow>(
          `SELECT
             COUNT(*)                                              AS total,
             COUNT(*) FILTER (WHERE l.status = 'draft')           AS draft,
             COUNT(*) FILTER (WHERE l.status = 'pending_review')  AS pending_review,
             COUNT(*) FILTER (WHERE l.status = 'published')       AS published,
             (
               SELECT COUNT(DISTINCT mr.listing_id)
               FROM moderation_reviews mr
               INNER JOIN listings l2 ON l2.id = mr.listing_id
               WHERE l2.user_id     = $1
                 AND l2.deleted_at  IS NULL
                 AND mr.decision    = 'rejected'
             )                                                     AS rejected
           FROM listings l
           WHERE l.user_id = $1 AND l.deleted_at IS NULL`,
          [userId],
        ),

        // 3. Most recent listings
        this.pool.query<ListingRow>(
          `SELECT * FROM listings
           WHERE user_id = $1 AND deleted_at IS NULL
           ORDER BY created_at DESC
           LIMIT $2`,
          [userId, RECENT_LISTINGS_LIMIT],
        ),

        // 4. Unread notification count
        this.pool.query<CountRow>(
          `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
          [userId],
        ),
      ]);

      const userRow = userResult.rows[0];
      if (!userRow) return null;

      return {
        profile: toUserDomain(userRow),
        stats: toStats(statsResult.rows[0]),
        recentListings: listingsResult.rows.map(toListingDomain),
        unreadNotifications: Number.parseInt(notifResult.rows[0]?.count ?? '0', 10),
      };
    } catch (err) {
      handleDbError(err, 'DashboardRepository.getUserDashboard');
    }
  }
}

export { DASHBOARD_REPOSITORY };
