import { Injectable, Inject } from '@nestjs/common';
import { type Pool, type PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction, handleDbError } from '../database/helpers/query.helper';
import type { ICategoriesRepository } from './interfaces/categories-repository.interface';
import type { Category, CreateCategoryData, UpdateCategoryData } from './domain/category';

interface CategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

function toDomain(row: CategoryRow): Category {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class CategoriesRepository implements ICategoriesRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Category[]> {
    try {
      const result = await this.pool.query<CategoryRow>(
        'SELECT * FROM categories ORDER BY sort_order ASC, name ASC',
      );
      return result.rows.map(toDomain);
    } catch (err) {
      handleDbError(err, 'CategoriesRepository.findAll');
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const row = await queryOne<CategoryRow>(
        this.pool,
        'SELECT * FROM categories WHERE id = $1',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'CategoriesRepository.findById');
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const row = await queryOne<CategoryRow>(
        this.pool,
        'SELECT * FROM categories WHERE slug = $1',
        [slug],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'CategoriesRepository.findBySlug');
    }
  }

  async findChildren(parentId: string): Promise<Category[]> {
    try {
      const result = await this.pool.query<CategoryRow>(
        'SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order ASC, name ASC',
        [parentId],
      );
      return result.rows.map(toDomain);
    } catch (err) {
      handleDbError(err, 'CategoriesRepository.findChildren');
    }
  }

  async create(data: CreateCategoryData): Promise<Category> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<CategoryRow>(
          `INSERT INTO categories (parent_id, name, slug, description, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            data.parentId ?? null,
            data.name,
            data.slug,
            data.description ?? null,
            data.sortOrder ?? 0,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Insert returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'CategoriesRepository.create');
      }
    });
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<CategoryRow>(
          `UPDATE categories
           SET parent_id   = COALESCE($1, parent_id),
               name        = COALESCE($2, name),
               slug        = COALESCE($3, slug),
               description = COALESCE($4, description),
               sort_order  = COALESCE($5, sort_order),
               updated_at  = NOW()
           WHERE id = $6
           RETURNING *`,
          [
            data.parentId ?? null,
            data.name ?? null,
            data.slug ?? null,
            data.description ?? null,
            data.sortOrder ?? null,
            id,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'CategoriesRepository.update');
      }
    });
  }

  async delete(id: string): Promise<void> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        await client.query('DELETE FROM categories WHERE id = $1', [id]);
      } catch (err) {
        handleDbError(err, 'CategoriesRepository.delete');
      }
    });
  }
}
