/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

/**
 * Database connection config used by node-pg-migrate.
 * node-pg-migrate reads DATABASE_URL from environment automatically;
 * this file is the reference for all environment-specific overrides.
 */
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    ssl: false,
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    ssl: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
};
