import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type { IAdminDashboardRepository } from './interfaces/admin-dashboard-repository.interface';
import type { AdminDashboard } from './domain/admin-dashboard';

// ── Row types ─────────────────────────────────────────────────────────────────

interface UsersStatsRow {
  total: string;
  active: string;
  blocked: string;
}

interface OrgsStatsRow {
  total: string;
  active: string;
}

interface ListingsStatsRow {
  total: string;
  draft: string;
  pending_review: string;
  published: string;
  rejected: string;
}

interface SystemStatsRow {
  notifications_sent: string;
  audit_logs_generated: string;
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class AdminDashboardRepository implements IAdminDashboardRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getDashboard(): Promise<AdminDashboard> {
    try {
      // All 4 queries run concurrently — zero N+1, single round-trip latency
      const [usersResult, orgsResult, listingsResult, systemResult] = await Promise.all([
        // 1. User aggregates — total, active (not soft-deleted), blocked (soft-deleted)
        this.pool.query<UsersStatsRow>(
          `SELECT
             COUNT(*)                                         AS total,
             COUNT(*) FILTER (WHERE deleted_at IS NULL)      AS active,
             COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)  AS blocked
           FROM users`,
        ),

        // 2. Organization aggregates — total, active
        this.pool.query<OrgsStatsRow>(
          `SELECT
             COUNT(*)                                         AS total,
             COUNT(*) FILTER (WHERE deleted_at IS NULL)      AS active
           FROM organizations`,
        ),

        // 3. Platform-wide listing stats + rejected count via moderation_reviews.
        //    Rejected listings revert to 'draft' — tracked via decision = 'rejected' in
        //    moderation_reviews. pending_review count is reused for moderation.pendingReviews.
        this.pool.query<ListingsStatsRow>(
          `SELECT
             COUNT(*)                                               AS total,
             COUNT(*) FILTER (WHERE l.status = 'draft')             AS draft,
             COUNT(*) FILTER (WHERE l.status = 'pending_review')    AS pending_review,
             COUNT(*) FILTER (WHERE l.status = 'published')         AS published,
             (
               SELECT COUNT(DISTINCT listing_id)
               FROM moderation_reviews
               WHERE decision = 'rejected'
             )                                                       AS rejected
           FROM listings l
           WHERE l.deleted_at IS NULL`,
        ),

        // 4. System stats — both counts in one query via scalar subqueries
        this.pool.query<SystemStatsRow>(
          `SELECT
             (SELECT COUNT(*) FROM notifications) AS notifications_sent,
             (SELECT COUNT(*) FROM audit_logs)    AS audit_logs_generated`,
        ),
      ]);

      const pendingCount = Number.parseInt(listingsResult.rows[0]?.pending_review ?? '0', 10);

      return {
        users: {
          totalUsers: Number.parseInt(usersResult.rows[0]?.total ?? '0', 10),
          activeUsers: Number.parseInt(usersResult.rows[0]?.active ?? '0', 10),
          blockedUsers: Number.parseInt(usersResult.rows[0]?.blocked ?? '0', 10),
        },
        organizations: {
          totalOrganizations: Number.parseInt(orgsResult.rows[0]?.total ?? '0', 10),
          activeOrganizations: Number.parseInt(orgsResult.rows[0]?.active ?? '0', 10),
        },
        listings: {
          totalListings: Number.parseInt(listingsResult.rows[0]?.total ?? '0', 10),
          draftListings: Number.parseInt(listingsResult.rows[0]?.draft ?? '0', 10),
          pendingListings: pendingCount,
          approvedListings: Number.parseInt(listingsResult.rows[0]?.published ?? '0', 10),
          rejectedListings: Number.parseInt(listingsResult.rows[0]?.rejected ?? '0', 10),
        },
        moderation: {
          pendingReviews: pendingCount,
        },
        system: {
          notificationsSent: Number.parseInt(systemResult.rows[0]?.notifications_sent ?? '0', 10),
          auditLogsGenerated: Number.parseInt(
            systemResult.rows[0]?.audit_logs_generated ?? '0',
            10,
          ),
        },
      };
    } catch (err) {
      handleDbError(err, 'AdminDashboardRepository.getDashboard');
    }
  }
}
