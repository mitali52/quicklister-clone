'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE listing_media (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      url         TEXT        NOT NULL,
      filename    TEXT        NOT NULL,
      mime_type   TEXT        NOT NULL,
      size_bytes  INTEGER     NOT NULL,
      sort_order  INTEGER     NOT NULL DEFAULT 0,
      is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_listing_media_listing_id  ON listing_media(listing_id);
    CREATE INDEX idx_listing_media_sort_order  ON listing_media(listing_id, sort_order);
    CREATE INDEX idx_listing_media_is_primary  ON listing_media(listing_id, is_primary);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_listing_media_is_primary;
    DROP INDEX IF EXISTS idx_listing_media_sort_order;
    DROP INDEX IF EXISTS idx_listing_media_listing_id;
    DROP TABLE IF EXISTS listing_media;
  `);
};
