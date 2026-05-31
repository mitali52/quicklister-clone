import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type { IModeratorDashboardRepository } from './interfaces/moderator-dashboard-repository.interface';
import type {
  ModeratorDashboard,
  RecentReview,
  ReviewDecision,
} from './domain/moderator-dashboard';

// ── Row types ─────────────────────────────────────────────────────────────────

interface TodayStatsRow {
  approved_today: string;
  rejected_today: string;
}

interface PendingCountRow {
  count: string;
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
}

interface TotalCountRow {
  count: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

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
export class ModeratorDashboardRepository implements IModeratorDashboardRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getDashboard(page: number, limit: number): Promise<ModeratorDashboard> {
    const offset = (page - 1) * limit;

    try {
      // All 4 queries execute concurrently — single round-trip latency
      const [todayStatsResult, pendingResult, reviewsResult, reviewsTotalResult] =
        await Promise.all([
          // 1. Today's approved + rejected decisions in one aggregation query
          this.pool.query<TodayStatsRow>(
            `SELECT
               COUNT(*) FILTER (WHERE decision = 'approved') AS approved_today,
               COUNT(*) FILTER (WHERE decision = 'rejected') AS rejected_today
             FROM moderation_reviews
             WHERE created_at >= CURRENT_DATE`,
          ),

          // 2. Listings awaiting review — shared value for pendingReviews + listingsWaiting
          this.pool.query<PendingCountRow>(
            `SELECT COUNT(*) AS count
             FROM listings
             WHERE status = 'pending_review' AND deleted_at IS NULL`,
          ),

          // 3. Recent reviews — JOIN listing title + reviewer identity, paginated
          this.pool.query<RecentReviewRow>(
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
               mr.created_at      AS reviewed_at
             FROM moderation_reviews mr
             INNER JOIN listings l ON l.id = mr.listing_id
             INNER JOIN users   u ON u.id = mr.reviewer_id
             ORDER BY mr.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset],
          ),

          // 4. Total review count for pagination metadata
          this.pool.query<TotalCountRow>(`SELECT COUNT(*) AS count FROM moderation_reviews`),
        ]);

      const pendingCount = Number.parseInt(pendingResult.rows[0]?.count ?? '0', 10);
      const total = Number.parseInt(reviewsTotalResult.rows[0]?.count ?? '0', 10);

      return {
        reviewStats: {
          pendingReviews: pendingCount,
          approvedToday: Number.parseInt(todayStatsResult.rows[0]?.approved_today ?? '0', 10),
          rejectedToday: Number.parseInt(todayStatsResult.rows[0]?.rejected_today ?? '0', 10),
        },
        queueStats: {
          listingsWaiting: pendingCount,
        },
        recentReviews: {
          items: reviewsResult.rows.map(toRecentReview),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      handleDbError(err, 'ModeratorDashboardRepository.getDashboard');
    }
  }
}
