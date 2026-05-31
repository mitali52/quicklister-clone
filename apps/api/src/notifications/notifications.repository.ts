import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { handleDbError } from '../database/helpers/query.helper';
import type {
  CreateNotificationData,
  Notification,
  NotificationFilters,
  NotificationType,
  PaginatedNotificationResult,
} from './domain/notification';
import type { INotificationsRepository } from './interfaces/notifications-repository.interface';

// ── Row shapes ─────────────────────────────────────────────────────────────────

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface CountRow {
  total: string;
}

// ── Mapper ─────────────────────────────────────────────────────────────────────

function toDomain(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    metadata: row.metadata,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
export class NotificationsRepository implements INotificationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    try {
      const result = await this.pool.query<NotificationRow>(
        `
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          data.userId,
          data.title,
          data.message,
          data.type,
          JSON.stringify(data.metadata ?? {}),
        ],
      );

      const row = result.rows[0];
      if (!row) throw new Error('Notification insert returned no row');
      return toDomain(row);
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.create');
    }
  }

  async findByUserId(
    userId: string,
    filters: NotificationFilters,
  ): Promise<PaginatedNotificationResult> {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: string[] = ['n.user_id = $1'];
    const params: unknown[] = [userId];

    if (filters.type !== undefined) {
      params.push(filters.type);
      conditions.push(`n.type = $${params.length}`);
    }

    if (filters.isRead !== undefined) {
      params.push(filters.isRead);
      conditions.push(`n.is_read = $${params.length}`);
    }

    const { where, params: condParams } = buildConditions(conditions, params);
    const selectParams = [...condParams, filters.limit, offset];

    try {
      const [itemsResult, countResult] = await Promise.all([
        this.pool.query<NotificationRow>(
          `
          SELECT *
          FROM notifications n
          ${where}
          ORDER BY n.created_at DESC
          LIMIT $${selectParams.length - 1} OFFSET $${selectParams.length}
          `,
          selectParams,
        ),
        this.pool.query<CountRow>(
          `SELECT COUNT(*) AS total FROM notifications n ${where}`,
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
      handleDbError(err, 'NotificationsRepository.findByUserId');
    }
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      const result = await this.pool.query<NotificationRow>(
        `SELECT * FROM notifications WHERE id = $1`,
        [id],
      );
      const row = result.rows[0];
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.findById');
    }
  }

  async countUnread(userId: string): Promise<number> {
    try {
      const result = await this.pool.query<CountRow>(
        `SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
        [userId],
      );
      return parseInt(result.rows[0]?.total ?? '0', 10);
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.countUnread');
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await this.pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND is_read = FALSE
        `,
        [id],
      );
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.markRead');
    }
  }

  async markAllRead(userId: string): Promise<void> {
    try {
      await this.pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
        WHERE user_id = $1 AND is_read = FALSE
        `,
        [userId],
      );
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.markAllRead');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);
    } catch (err) {
      handleDbError(err, 'NotificationsRepository.delete');
    }
  }
}
