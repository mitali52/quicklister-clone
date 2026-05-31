/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE user_role_name AS ENUM (
      'user',
      'moderator',
      'seller',
      'landlord',
      'commercial_owner',
      'pro_lister',
      'admin'
    );

    CREATE TABLE roles (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name        user_role_name NOT NULL UNIQUE,
      description TEXT        NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS roles;
    DROP TYPE IF EXISTS user_role_name;
  `);
};
