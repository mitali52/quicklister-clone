import { Pool } from 'pg';
import { getDatabaseConfig } from './database.config';

export const DATABASE_POOL = Symbol('DATABASE_POOL');

export const databaseProviders = [
  {
    provide: DATABASE_POOL,
    useFactory: (): Pool => {
      const config = getDatabaseConfig();
      return new Pool({
        connectionString: config.url,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      });
    },
  },
];
