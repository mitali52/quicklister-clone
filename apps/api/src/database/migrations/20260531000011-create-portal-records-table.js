/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE portal_records (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      record_type   TEXT        NOT NULL,
      title         TEXT        NOT NULL,
      status        TEXT        NOT NULL DEFAULT 'draft',
      amount        NUMERIC(12,2),
      currency      TEXT        NOT NULL DEFAULT 'GBP',
      payload       JSONB       NOT NULL DEFAULT '{}'::jsonb,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at    TIMESTAMPTZ
    );

    CREATE INDEX idx_portal_records_user_id ON portal_records(user_id);
    CREATE INDEX idx_portal_records_record_type ON portal_records(record_type);
    CREATE INDEX idx_portal_records_status ON portal_records(status);
    CREATE INDEX idx_portal_records_created_at ON portal_records(created_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_portal_records_created_at;
    DROP INDEX IF EXISTS idx_portal_records_status;
    DROP INDEX IF EXISTS idx_portal_records_record_type;
    DROP INDEX IF EXISTS idx_portal_records_user_id;
    DROP TABLE IF EXISTS portal_records;
  `);
};
