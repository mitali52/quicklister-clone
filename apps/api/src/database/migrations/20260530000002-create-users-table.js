/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id         UUID        NOT NULL REFERENCES roles(id),
      email           TEXT        NOT NULL UNIQUE,
      password_hash   TEXT        NOT NULL,
      full_name       TEXT        NOT NULL,
      phone_number    TEXT,
      address_line1   TEXT,
      address_line2   TEXT,
      city            TEXT,
      county          TEXT,
      postcode        TEXT,
      email_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
      nrla_member     BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at      TIMESTAMPTZ
    );

    CREATE INDEX idx_users_role_id    ON users(role_id);
    CREATE INDEX idx_users_email      ON users(email);
    CREATE INDEX idx_users_deleted_at ON users(deleted_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_users_deleted_at;
    DROP INDEX IF EXISTS idx_users_email;
    DROP INDEX IF EXISTS idx_users_role_id;
    DROP TABLE IF EXISTS users;
  `);
};
