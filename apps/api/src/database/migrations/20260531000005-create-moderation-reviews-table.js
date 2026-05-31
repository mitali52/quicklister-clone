'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE moderation_decision AS ENUM ('approved', 'rejected');

    CREATE TABLE moderation_reviews (
      id           UUID                NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id   UUID                NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      reviewer_id  UUID                NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      decision     moderation_decision NOT NULL,
      notes        TEXT,
      created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_moderation_reviews_listing_id  ON moderation_reviews(listing_id);
    CREATE INDEX idx_moderation_reviews_reviewer_id ON moderation_reviews(reviewer_id);
    CREATE INDEX idx_moderation_reviews_created_at  ON moderation_reviews(created_at DESC);

    -- Partial index for the review queue: only published + pending rows matter for fast lookups
    CREATE INDEX idx_listings_pending_review_queue
      ON listings (updated_at ASC)
      WHERE status = 'pending_review' AND deleted_at IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_listings_pending_review_queue;
    DROP INDEX IF EXISTS idx_moderation_reviews_created_at;
    DROP INDEX IF EXISTS idx_moderation_reviews_reviewer_id;
    DROP INDEX IF EXISTS idx_moderation_reviews_listing_id;
    DROP TABLE IF EXISTS moderation_reviews;
    DROP TYPE IF EXISTS moderation_decision;
  `);
};
