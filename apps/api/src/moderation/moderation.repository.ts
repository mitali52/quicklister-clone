import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError, transaction } from '../database/helpers/query.helper';
import type { ListingStatus, ListingType, PropertyType } from '../listings/domain/listing';
import type {
  CreateReviewData,
  ModerationReview,
  ModerationReviewWithReviewer,
  PaginatedQueueResult,
  ReviewDecision,
  ReviewQueueItem,
} from './domain/moderation-review';
import type { IModerationRepository } from './interfaces/moderation-repository.interface';

// ── Row shapes ────────────────────────────────────────────────────────────────

interface ModerationReviewRow {
  id: string;
  listing_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  notes: string | null;
  created_at: Date;
}

interface ModerationReviewWithReviewerRow extends ModerationReviewRow {
  reviewer_name: string;
  reviewer_email: string;
}

interface QueueRow {
  id: string;
  title: string;
  listing_type: ListingType;
  property_type: PropertyType;
  asking_price: number | null;
  monthly_rent: number | null;
  city: string;
  postcode: string;
  bedrooms: number | null;
  updated_at: Date;
  primary_photo_url: string | null;
  submitter_id: string;
  submitter_name: string;
  submitter_email: string;
}

interface CountRow {
  total: string;
}

interface ListingStatusRow {
  status: ListingStatus;
}

interface UpdatedIdRow {
  id: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function reviewToDomain(row: ModerationReviewRow): ModerationReview {
  return {
    id: row.id,
    listingId: row.listing_id,
    reviewerId: row.reviewer_id,
    decision: row.decision,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function reviewWithReviewerToDomain(row: ModerationReviewWithReviewerRow): ModerationReviewWithReviewer {
  return {
    id: row.id,
    listingId: row.listing_id,
    reviewerId: row.reviewer_id,
    decision: row.decision,
    notes: row.notes,
    createdAt: row.created_at,
    reviewerName: row.reviewer_name,
    reviewerEmail: row.reviewer_email,
  };
}

function queueItemToDomain(row: QueueRow): ReviewQueueItem {
  return {
    id: row.id,
    title: row.title,
    listingType: row.listing_type,
    propertyType: row.property_type,
    askingPrice: row.asking_price,
    monthlyRent: row.monthly_rent,
    city: row.city,
    postcode: row.postcode,
    bedrooms: row.bedrooms,
    submittedAt: row.updated_at,
    primaryPhotoUrl: row.primary_photo_url,
    submitter: {
      id: row.submitter_id,
      fullName: row.submitter_name,
      email: row.submitter_email,
    },
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class ModerationRepository implements IModerationRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findQueue(page: number, limit: number): Promise<PaginatedQueueResult> {
    const offset = (page - 1) * limit;

    try {
      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<QueueRow>(
          `
          SELECT
            l.id,
            l.title,
            l.listing_type,
            l.property_type,
            l.asking_price,
            l.monthly_rent,
            l.city,
            l.postcode,
            l.bedrooms,
            l.updated_at,
            lm.url  AS primary_photo_url,
            u.id    AS submitter_id,
            u.full_name AS submitter_name,
            u.email AS submitter_email
          FROM listings l
          INNER JOIN users u ON u.id = l.user_id AND u.deleted_at IS NULL
          LEFT  JOIN listing_media lm ON lm.listing_id = l.id AND lm.is_primary = TRUE
          WHERE l.status = 'pending_review'
            AND l.deleted_at IS NULL
          ORDER BY l.updated_at ASC
          LIMIT $1 OFFSET $2
          `,
          [limit, offset],
        ),
        this.pool.query<CountRow>(
          `
          SELECT COUNT(*) AS total
          FROM listings l
          WHERE l.status = 'pending_review'
            AND l.deleted_at IS NULL
          `,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(queueItemToDomain),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      handleDbError(err, 'ModerationRepository.findQueue');
    }
  }

  async findListingStatus(listingId: string): Promise<{ status: ListingStatus } | null> {
    try {
      const result = await this.pool.query<ListingStatusRow>(
        `SELECT status FROM listings WHERE id = $1 AND deleted_at IS NULL`,
        [listingId],
      );
      const row = result.rows[0];
      return row ? { status: row.status } : null;
    } catch (err) {
      handleDbError(err, 'ModerationRepository.findListingStatus');
    }
  }

  async createReviewAndUpdateStatus(
    data: CreateReviewData,
    newStatus: ListingStatus,
  ): Promise<ModerationReview> {
    return transaction(this.pool, async (client) => {
      try {
        // Update listing status atomically — only succeeds if currently pending_review
        const updateResult = await client.query<UpdatedIdRow>(
          `
          UPDATE listings
          SET status = $1, updated_at = NOW()
          WHERE id = $2 AND status = 'pending_review'
          RETURNING id
          `,
          [newStatus, data.listingId],
        );

        if (updateResult.rowCount === 0) {
          // Either deleted between check and update, or concurrent review already processed it
          throw new BadRequestException(
            'Listing is no longer available for review — it may have already been processed',
          );
        }

        // Create the audit record
        const insertResult = await client.query<ModerationReviewRow>(
          `
          INSERT INTO moderation_reviews (listing_id, reviewer_id, decision, notes)
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [data.listingId, data.reviewerId, data.decision, data.notes ?? null],
        );

        const row = insertResult.rows[0];
        if (!row) throw new Error('Review insert returned no row');

        return reviewToDomain(row);
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        handleDbError(err, 'ModerationRepository.createReviewAndUpdateStatus');
      }
    });
  }

  async findReviewsByListingId(listingId: string): Promise<ModerationReviewWithReviewer[]> {
    try {
      const result = await this.pool.query<ModerationReviewWithReviewerRow>(
        `
        SELECT
          mr.id,
          mr.listing_id,
          mr.reviewer_id,
          mr.decision,
          mr.notes,
          mr.created_at,
          u.full_name AS reviewer_name,
          u.email     AS reviewer_email
        FROM moderation_reviews mr
        INNER JOIN users u ON u.id = mr.reviewer_id
        WHERE mr.listing_id = $1
        ORDER BY mr.created_at DESC
        `,
        [listingId],
      );
      return result.rows.map(reviewWithReviewerToDomain);
    } catch (err) {
      handleDbError(err, 'ModerationRepository.findReviewsByListingId');
    }
  }
}
