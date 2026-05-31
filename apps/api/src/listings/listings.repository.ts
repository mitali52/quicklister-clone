import { Injectable, Inject } from '@nestjs/common';
import { type Pool, type PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction, handleDbError } from '../database/helpers/query.helper';
import {
  type IListingsRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/listings-repository.interface';
import type {
  Listing,
  ListingStatus,
  ListingType,
  PropertyType,
  CreateListingData,
  UpdateListingData,
} from './domain/listing';

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

function toDomain(row: ListingRow): Listing {
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

@Injectable()
export class ListingsRepository implements IListingsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<ListingRow>(
          'SELECT * FROM listings WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM listings WHERE deleted_at IS NULL',
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'ListingsRepository.findAll');
    }
  }

  async findById(id: string): Promise<Listing | null> {
    try {
      const row = await queryOne<ListingRow>(
        this.pool,
        'SELECT * FROM listings WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'ListingsRepository.findById');
    }
  }

  async findByUserId(userId: string, opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<ListingRow>(
          'SELECT * FROM listings WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [userId, limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM listings WHERE user_id = $1 AND deleted_at IS NULL',
          [userId],
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'ListingsRepository.findByUserId');
    }
  }

  async findByStatus(status: ListingStatus, opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<ListingRow>(
          'SELECT * FROM listings WHERE status = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [status, limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM listings WHERE status = $1 AND deleted_at IS NULL',
          [status],
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'ListingsRepository.findByStatus');
    }
  }

  async create(data: CreateListingData): Promise<Listing> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<ListingRow>(
          `INSERT INTO listings
             (user_id, title, description, listing_type, property_type,
              asking_price, monthly_rent, address_line1, address_line2,
              city, postcode, bedrooms, bathrooms)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            data.userId,
            data.title,
            data.description ?? null,
            data.listingType,
            data.propertyType,
            data.askingPrice ?? null,
            data.monthlyRent ?? null,
            data.addressLine1,
            data.addressLine2 ?? null,
            data.city,
            data.postcode,
            data.bedrooms ?? null,
            data.bathrooms ?? null,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Insert returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'ListingsRepository.create');
      }
    });
  }

  async update(id: string, data: UpdateListingData): Promise<Listing> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<ListingRow>(
          `UPDATE listings
           SET title         = COALESCE($1, title),
               description   = COALESCE($2, description),
               listing_type  = COALESCE($3, listing_type),
               property_type = COALESCE($4, property_type),
               asking_price  = COALESCE($5, asking_price),
               monthly_rent  = COALESCE($6, monthly_rent),
               address_line1 = COALESCE($7, address_line1),
               address_line2 = COALESCE($8, address_line2),
               city          = COALESCE($9, city),
               postcode      = COALESCE($10, postcode),
               bedrooms      = COALESCE($11, bedrooms),
               bathrooms     = COALESCE($12, bathrooms),
               updated_at    = NOW()
           WHERE id = $13 AND deleted_at IS NULL
           RETURNING *`,
          [
            data.title ?? null,
            data.description ?? null,
            data.listingType ?? null,
            data.propertyType ?? null,
            data.askingPrice ?? null,
            data.monthlyRent ?? null,
            data.addressLine1 ?? null,
            data.addressLine2 ?? null,
            data.city ?? null,
            data.postcode ?? null,
            data.bedrooms ?? null,
            data.bathrooms ?? null,
            id,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'ListingsRepository.update');
      }
    });
  }

  async updateStatus(id: string, status: ListingStatus): Promise<Listing> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<ListingRow>(
          `UPDATE listings
           SET status = $1, updated_at = NOW()
           WHERE id = $2 AND deleted_at IS NULL
           RETURNING *`,
          [status, id],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'ListingsRepository.updateStatus');
      }
    });
  }

  async softDelete(id: string): Promise<void> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        await client.query(
          'UPDATE listings SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
          [id],
        );
      } catch (err) {
        handleDbError(err, 'ListingsRepository.softDelete');
      }
    });
  }
}
