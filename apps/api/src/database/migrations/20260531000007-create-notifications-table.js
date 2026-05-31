'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE notification_type AS ENUM (
      'listing_approved',
      'listing_rejected',
      'listing_submitted',
      'organization_approved',
      'organization_rejected',
      'user_blocked',
      'user_unblocked',
      'password_changed',
      'system'
    );

    CREATE TABLE notifications (
      id         UUID              NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT              NOT NULL,
      message    TEXT              NOT NULL,
      type       notification_type NOT NULL,
      metadata   JSONB             NOT NULL DEFAULT '{}',
      is_read    BOOLEAN           NOT NULL DEFAULT FALSE,
      read_at    TIMESTAMPTZ,
      created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_notifications_user_id         ON notifications(user_id);
    CREATE INDEX idx_notifications_user_is_read    ON notifications(user_id, is_read);
    CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
    CREATE INDEX idx_notifications_user_type       ON notifications(user_id, type);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_notifications_user_type;
    DROP INDEX IF EXISTS idx_notifications_user_created_at;
    DROP INDEX IF EXISTS idx_notifications_user_is_read;
    DROP INDEX IF EXISTS idx_notifications_user_id;
    DROP TABLE IF EXISTS notifications;
    DROP TYPE IF EXISTS notification_type;
  `);
};
