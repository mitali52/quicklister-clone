import { Injectable, Inject } from '@nestjs/common';
import { type Pool, type PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction, handleDbError } from '../database/helpers/query.helper';
import {
  type IOrganizationsRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/organizations-repository.interface';
import type {
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
} from './domain/organization';

interface OrganizationRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function toDomain(row: OrganizationRow): Organization {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

@Injectable()
export class OrganizationsRepository implements IOrganizationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<Organization>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<OrganizationRow>(
          'SELECT * FROM organizations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM organizations WHERE deleted_at IS NULL',
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'OrganizationsRepository.findAll');
    }
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      const row = await queryOne<OrganizationRow>(
        this.pool,
        'SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'OrganizationsRepository.findById');
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      const row = await queryOne<OrganizationRow>(
        this.pool,
        'SELECT * FROM organizations WHERE slug = $1 AND deleted_at IS NULL',
        [slug],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'OrganizationsRepository.findBySlug');
    }
  }

  async findByOwnerId(ownerId: string, opts: PaginationOpts): Promise<PaginatedResult<Organization>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<OrganizationRow>(
          'SELECT * FROM organizations WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [ownerId, limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM organizations WHERE owner_id = $1 AND deleted_at IS NULL',
          [ownerId],
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'OrganizationsRepository.findByOwnerId');
    }
  }

  async create(data: CreateOrganizationData): Promise<Organization> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<OrganizationRow>(
          `INSERT INTO organizations (owner_id, name, slug, description, logo_url, website_url)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            data.ownerId,
            data.name,
            data.slug,
            data.description ?? null,
            data.logoUrl ?? null,
            data.websiteUrl ?? null,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Insert returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'OrganizationsRepository.create');
      }
    });
  }

  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<OrganizationRow>(
          `UPDATE organizations
           SET name        = COALESCE($1, name),
               slug        = COALESCE($2, slug),
               description = COALESCE($3, description),
               logo_url    = COALESCE($4, logo_url),
               website_url = COALESCE($5, website_url),
               updated_at  = NOW()
           WHERE id = $6 AND deleted_at IS NULL
           RETURNING *`,
          [
            data.name ?? null,
            data.slug ?? null,
            data.description ?? null,
            data.logoUrl ?? null,
            data.websiteUrl ?? null,
            id,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'OrganizationsRepository.update');
      }
    });
  }

  async softDelete(id: string): Promise<void> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        await client.query(
          'UPDATE organizations SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
          [id],
        );
      } catch (err) {
        handleDbError(err, 'OrganizationsRepository.softDelete');
      }
    });
  }
}
