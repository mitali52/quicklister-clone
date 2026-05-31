'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE organizations (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      name        TEXT        NOT NULL,
      slug        TEXT        NOT NULL,
      description TEXT,
      logo_url    TEXT,
      website_url TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at  TIMESTAMPTZ,
      CONSTRAINT uq_organizations_slug UNIQUE (slug)
    );

    CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
    CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_organizations_deleted_at;
    DROP INDEX IF EXISTS idx_organizations_owner_id;
    DROP TABLE IF EXISTS organizations;
  `);
};
