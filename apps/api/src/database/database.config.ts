export interface DatabaseConfig {
  url: string;
  ssl: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return {
    url,
    ssl: process.env.NODE_ENV === 'production',
  };
}
