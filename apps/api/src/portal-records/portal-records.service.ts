import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction } from '../database/helpers/query.helper';
import {
  PORTAL_RECORD_TYPES,
  type PortalRecordType,
} from './dto/create-portal-record.dto';
import type { PortalRecord } from './interfaces/portal-record.interface';
import { type CreatePortalRecordDto } from './dto/create-portal-record.dto';
import { type UpdatePortalRecordDto } from './dto/update-portal-record.dto';

interface PortalRecordRow {
  id: string;
  user_id: string;
  record_type: PortalRecordType;
  title: string;
  status: string;
  amount: string | null;
  currency: string;
  payload: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

function toDomain(row: PortalRecordRow): PortalRecord {
  return {
    id: row.id,
    userId: row.user_id,
    recordType: row.record_type,
    title: row.title,
    status: row.status,
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    payload: row.payload ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class PortalRecordsService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  assertRecordType(recordType: string): asserts recordType is PortalRecordType {
    if (!PORTAL_RECORD_TYPES.includes(recordType as PortalRecordType)) {
      throw new NotFoundException('Record type not found');
    }
  }

  async findAll(userId: string, recordType: PortalRecordType): Promise<PortalRecord[]> {
    try {
      const result = await this.pool.query<PortalRecordRow>(
        `SELECT *
         FROM portal_records
         WHERE user_id = $1
           AND record_type = $2
           AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [userId, recordType],
      );

      return result.rows.map(toDomain);
    } catch (err) {
      throw new InternalServerErrorException('Failed to load portal records', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async findById(userId: string, id: string): Promise<PortalRecord> {
    try {
      const row = await queryOne<PortalRecordRow>(
        this.pool,
        `SELECT *
         FROM portal_records
         WHERE id = $1
           AND user_id = $2
           AND deleted_at IS NULL`,
        [id, userId],
      );

      if (!row) throw new NotFoundException(`Portal record ${id} not found`);
      return toDomain(row);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to load portal record', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async create(userId: string, dto: CreatePortalRecordDto): Promise<PortalRecord> {
    try {
      const result = await this.pool.query<PortalRecordRow>(
        `INSERT INTO portal_records (user_id, record_type, title, status, amount, currency, payload)
         VALUES ($1, $2, $3, COALESCE($4, 'draft'), $5, COALESCE($6, 'GBP'), COALESCE($7, '{}'::jsonb))
         RETURNING *`,
        [
          userId,
          dto.recordType,
          dto.title,
          dto.status ?? null,
          dto.amount ?? null,
          dto.currency ?? null,
          dto.payload ?? null,
        ],
      );
      return toDomain(result.rows[0] as PortalRecordRow);
    } catch (err) {
      throw new InternalServerErrorException('Failed to create portal record', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async update(userId: string, id: string, dto: UpdatePortalRecordDto): Promise<PortalRecord> {
    try {
      return await transaction(this.pool, async (client) => {
        const result = await client.query<PortalRecordRow>(
          `UPDATE portal_records
           SET record_type = COALESCE($1, record_type),
               title = COALESCE($2, title),
               status = COALESCE($3, status),
               amount = COALESCE($4, amount),
               currency = COALESCE($5, currency),
               payload = COALESCE($6, payload),
               updated_at = NOW()
           WHERE id = $7
             AND user_id = $8
             AND deleted_at IS NULL
           RETURNING *`,
          [
            dto.recordType ?? null,
            dto.title ?? null,
            dto.status ?? null,
            dto.amount ?? null,
            dto.currency ?? null,
            dto.payload ?? null,
            id,
            userId,
          ],
        );

        const row = result.rows[0];
        if (!row) throw new NotFoundException(`Portal record ${id} not found`);
        return toDomain(row);
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update portal record', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE portal_records
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE id = $1
           AND user_id = $2
           AND deleted_at IS NULL`,
        [id, userId],
      );
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete portal record', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }
}
