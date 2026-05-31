'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
    CREATE TYPE listing_type   AS ENUM ('residential_sale', 'residential_let', 'commercial_sale', 'commercial_let');
    CREATE TYPE property_type  AS ENUM ('detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other');

    CREATE TABLE listings (
      id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id        UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      title          TEXT           NOT NULL,
      description    TEXT,
      listing_type   listing_type   NOT NULL,
      property_type  property_type  NOT NULL,
      status         listing_status NOT NULL DEFAULT 'draft',
      asking_price   INTEGER,
      monthly_rent   INTEGER,
      address_line1  TEXT           NOT NULL,
      address_line2  TEXT,
      city           TEXT           NOT NULL,
      postcode       TEXT           NOT NULL,
      bedrooms       INTEGER,
      bathrooms      INTEGER,
      created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      deleted_at     TIMESTAMPTZ
    );

    CREATE INDEX idx_listings_user_id   ON listings(user_id);
    CREATE INDEX idx_listings_status    ON listings(status);
    CREATE INDEX idx_listings_deleted_at ON listings(deleted_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_listings_deleted_at;
    DROP INDEX IF EXISTS idx_listings_status;
    DROP INDEX IF EXISTS idx_listings_user_id;
    DROP TABLE IF EXISTS listings;
    DROP TYPE IF EXISTS property_type;
    DROP TYPE IF EXISTS listing_type;
    DROP TYPE IF EXISTS listing_status;
  `);
};
