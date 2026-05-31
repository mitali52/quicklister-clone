import { Injectable, Inject } from '@nestjs/common';
import { type Pool, type PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction, handleDbError } from '../database/helpers/query.helper';
import type {
  IListingMediaRepository,
} from './interfaces/listing-media-repository.interface';
import type {
  ListingMedia,
  CreateListingMediaData,
  ReorderItem,
} from './domain/listing-media';

interface ListingMediaRow {
  id: string;
  listing_id: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

function toDomain(row: ListingMediaRow): ListingMedia {
  return {
    id: row.id,
    listingId: row.listing_id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class ListingMediaRepository implements IListingMediaRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByListingId(listingId: string): Promise<ListingMedia[]> {
    try {
      const result = await this.pool.query<ListingMediaRow>(
        'SELECT * FROM listing_media WHERE listing_id = $1 ORDER BY sort_order ASC, created_at ASC',
        [listingId],
      );
      return result.rows.map(toDomain);
    } catch (err) {
      handleDbError(err, 'ListingMediaRepository.findByListingId');
    }
  }

  async findById(id: string): Promise<ListingMedia | null> {
    try {
      const row = await queryOne<ListingMediaRow>(
        this.pool,
        'SELECT * FROM listing_media WHERE id = $1',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'ListingMediaRepository.findById');
    }
  }

  async findListingOwner(listingId: string): Promise<string | null> {
    try {
      const row = await queryOne<{ user_id: string }>(
        this.pool,
        'SELECT user_id FROM listings WHERE id = $1 AND deleted_at IS NULL',
        [listingId],
      );
      return row?.user_id ?? null;
    } catch (err) {
      handleDbError(err, 'ListingMediaRepository.findListingOwner');
    }
  }

  async countByListingId(listingId: string): Promise<number> {
    try {
      const result = await this.pool.query<{ count: string }>(
        'SELECT COUNT(*) FROM listing_media WHERE listing_id = $1',
        [listingId],
      );
      return Number.parseInt(result.rows[0]?.count ?? '0', 10);
    } catch (err) {
      handleDbError(err, 'ListingMediaRepository.countByListingId');
    }
  }

  async create(data: CreateListingMediaData): Promise<ListingMedia> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<ListingMediaRow>(
          `INSERT INTO listing_media
             (listing_id, url, filename, mime_type, size_bytes, sort_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            data.listingId,
            data.url,
            data.filename,
            data.mimeType,
            data.sizeBytes,
            data.sortOrder,
            data.isPrimary,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Insert returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'ListingMediaRepository.create');
      }
    });
  }

  async reorder(listingId: string, items: ReorderItem[]): Promise<ListingMedia[]> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        // Find the minimum sortOrder to mark as primary
        const minSortOrder = Math.min(...items.map((i) => i.sortOrder));

        for (const item of items) {
          await client.query(
            `UPDATE listing_media
             SET sort_order = $1, is_primary = $2, updated_at = NOW()
             WHERE id = $3 AND listing_id = $4`,
            [item.sortOrder, item.sortOrder === minSortOrder, item.id, listingId],
          );
        }

        const result = await client.query<ListingMediaRow>(
          'SELECT * FROM listing_media WHERE listing_id = $1 ORDER BY sort_order ASC, created_at ASC',
          [listingId],
        );
        return result.rows.map(toDomain);
      } catch (err) {
        handleDbError(err, 'ListingMediaRepository.reorder');
      }
    });
  }

  async delete(id: string): Promise<ListingMedia> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        // Fetch before deleting so we can return it and optionally promote primary
        const existing = await queryOne<ListingMediaRow>(
          this.pool,
          'SELECT * FROM listing_media WHERE id = $1',
          [id],
        );
        if (!existing) throw new Error('Media not found');

        await client.query('DELETE FROM listing_media WHERE id = $1', [id]);

        // If the deleted item was primary, promote the next-lowest sort_order
        if (existing.is_primary) {
          await client.query(
            `UPDATE listing_media
             SET is_primary = TRUE, updated_at = NOW()
             WHERE id = (
               SELECT id FROM listing_media
               WHERE listing_id = $1
               ORDER BY sort_order ASC, created_at ASC
               LIMIT 1
             )`,
            [existing.listing_id],
          );
        }

        return toDomain(existing);
      } catch (err) {
        handleDbError(err, 'ListingMediaRepository.delete');
      }
    });
  }
}
