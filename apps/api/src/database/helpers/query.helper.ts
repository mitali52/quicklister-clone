import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { type Pool, type QueryResult, type QueryResultRow, type PoolClient } from 'pg';

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';

interface PgError extends Error {
  code?: string;
  detail?: string;
}

export function handleDbError(err: unknown, context?: string): never {
  if (err instanceof HttpException) {
    throw err;
  }

  const pgErr = err as PgError;
  const detail = context ? `[${context}] ` : '';

  if (pgErr.code === PG_UNIQUE_VIOLATION) {
    throw new ConflictException(`${detail}${pgErr.detail ?? 'Duplicate entry'}`);
  }
  if (pgErr.code === PG_FOREIGN_KEY_VIOLATION) {
    throw new BadRequestException(`${detail}${pgErr.detail ?? 'Referenced record does not exist'}`);
  }
  if (pgErr.code === PG_NOT_NULL_VIOLATION) {
    throw new BadRequestException(`${detail}${pgErr.detail ?? 'Required field is missing'}`);
  }

  throw new InternalServerErrorException(`${detail}Database operation failed`);
}

export async function query<T extends QueryResultRow>(
  pool: Pool,
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (err) {
    if (err instanceof HttpException) {
      throw err;
    }
    handleDbError(err);
  }
}

export async function queryOne<T extends QueryResultRow>(
  pool: Pool,
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  try {
    const result = await pool.query<T>(text, params);
    return result.rows[0] ?? null;
  } catch (err) {
    if (err instanceof HttpException) {
      throw err;
    }
    handleDbError(err);
  }
}

export async function transaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpException) {
      throw err;
    }
    handleDbError(err);
  } finally {
    client.release();
  }
}
