'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Text search: trigram GIN indexes for ILIKE queries
    CREATE INDEX idx_listings_search_title_trgm
      ON listings USING GIN (title gin_trgm_ops)
      WHERE deleted_at IS NULL;

    CREATE INDEX idx_listings_search_city_trgm
      ON listings USING GIN (city gin_trgm_ops)
      WHERE deleted_at IS NULL;

    -- Partial indexes scoped to published, non-deleted rows — the core search population
    CREATE INDEX idx_listings_search_published_date
      ON listings (created_at DESC)
      WHERE status = 'published' AND deleted_at IS NULL;

    CREATE INDEX idx_listings_search_listing_type
      ON listings (listing_type, property_type, created_at DESC)
      WHERE status = 'published' AND deleted_at IS NULL;

    CREATE INDEX idx_listings_search_price
      ON listings (asking_price, monthly_rent, created_at DESC)
      WHERE status = 'published' AND deleted_at IS NULL;

    CREATE INDEX idx_listings_search_bedrooms
      ON listings (bedrooms, created_at DESC)
      WHERE status = 'published' AND deleted_at IS NULL;

    -- Case-insensitive exact city match
    CREATE INDEX idx_listings_search_city_lower
      ON listings (LOWER(city))
      WHERE status = 'published' AND deleted_at IS NULL;

    -- Postcode prefix search (LIKE 'SW1%') — text_pattern_ops enables index use
    CREATE INDEX idx_listings_search_postcode_prefix
      ON listings (postcode text_pattern_ops)
      WHERE status = 'published' AND deleted_at IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_listings_search_postcode_prefix;
    DROP INDEX IF EXISTS idx_listings_search_city_lower;
    DROP INDEX IF EXISTS idx_listings_search_bedrooms;
    DROP INDEX IF EXISTS idx_listings_search_price;
    DROP INDEX IF EXISTS idx_listings_search_listing_type;
    DROP INDEX IF EXISTS idx_listings_search_published_date;
    DROP INDEX IF EXISTS idx_listings_search_city_trgm;
    DROP INDEX IF EXISTS idx_listings_search_title_trgm;
  `);
};
