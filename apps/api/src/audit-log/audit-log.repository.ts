import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type {
  AuditAction,
  AuditEntityType,
  AuditLog,
  AuditLogFilters,
  CreateAuditLogData,
  PaginatedAuditLogResult,
  RequestAuditContext,
} from './domain/audit-log';
import type { IAuditLogRepository } from './interfaces/audit-log-repository.interface';

// ── Row shapes ─────────────────────────────────────────────────────────────────

interface AuditLogRow {
  id: string;
  user_id: string;
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditAction;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

interface CountRow {
  total: string;
}

// ── Mapper ─────────────────────────────────────────────────────────────────────

function toDomain(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    oldValues: row.old_values,
    newValues: row.new_values,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

// ── Dynamic condition builder ──────────────────────────────────────────────────

interface BuiltConditions {
  where: string;
  params: unknown[];
}

function buildConditions(conditions: string[], params: unknown[]): BuiltConditions {
  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

// ── Repository ─────────────────────────────────────────────────────────────────

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(data: CreateAuditLogData & RequestAuditContext): Promise<AuditLog> {
    try {
      const result = await this.pool.query<AuditLogRow>(
        `
        INSERT INTO audit_logs
          (user_id, entity_type, entity_id, action, old_values, new_values, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          data.userId,
          data.entityType,
          data.entityId,
          data.action,
          data.oldValues != null ? JSON.stringify(data.oldValues) : null,
          data.newValues != null ? JSON.stringify(data.newValues) : null,
          data.ipAddress,
          data.userAgent,
        ],
      );

      const row = result.rows[0];
      if (!row) throw new Error('Audit log insert returned no row');
      return toDomain(row);
    } catch (err) {
      handleDbError(err, 'AuditLogRepository.create');
    }
  }

  async findAll(filters: AuditLogFilters): Promise<PaginatedAuditLogResult> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.userId !== undefined) {
      params.push(filters.userId);
      conditions.push(`al.user_id = $${params.length}`);
    }

    if (filters.entityType !== undefined) {
      params.push(filters.entityType);
      conditions.push(`al.entity_type = $${params.length}`);
    }

    if (filters.action !== undefined) {
      params.push(filters.action);
      conditions.push(`al.action = $${params.length}`);
    }

    if (filters.fromDate !== undefined) {
      params.push(new Date(filters.fromDate));
      conditions.push(`al.created_at >= $${params.length}`);
    }

    if (filters.toDate !== undefined) {
      params.push(new Date(filters.toDate));
      conditions.push(`al.created_at <= $${params.length}`);
    }

    const { where, params: condParams } = buildConditions(conditions, params);
    const selectParams = [...condParams, filters.limit, offset];

    try {
      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<AuditLogRow>(
          `
          SELECT al.*
          FROM audit_logs al
          ${where}
          ORDER BY al.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `SELECT COUNT(*) AS total FROM audit_logs al ${where}`,
          condParams,
        ),
      ]);

      const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
      return {
        items: itemsResult.rows.map(toDomain),
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    } catch (err) {
      handleDbError(err, 'AuditLogRepository.findAll');
    }
  }
}
