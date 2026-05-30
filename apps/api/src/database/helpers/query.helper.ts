import { type Pool, type QueryResult, type QueryResultRow } from 'pg';

export async function query<T extends QueryResultRow>(
  pool: Pool,
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function queryOne<T extends QueryResultRow>(
  pool: Pool,
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function transaction<T>(
  pool: Pool,
  fn: (client: Pool) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client as unknown as Pool);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    (client as { release: () => void }).release();
  }
}
