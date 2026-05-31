'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE categories (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_id   UUID        REFERENCES categories(id) ON DELETE RESTRICT,
      name        TEXT        NOT NULL,
      slug        TEXT        NOT NULL UNIQUE,
      description TEXT,
      sort_order  INTEGER     NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_categories_parent_id ON categories(parent_id);
    CREATE INDEX idx_categories_slug      ON categories(slug);
    CREATE INDEX idx_categories_sort_order ON categories(sort_order);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_categories_sort_order;
    DROP INDEX IF EXISTS idx_categories_slug;
    DROP INDEX IF EXISTS idx_categories_parent_id;
    DROP TABLE IF EXISTS categories;
  `);
};
