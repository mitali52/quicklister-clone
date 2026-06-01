/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE password_reset_tokens (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash  TEXT        NOT NULL UNIQUE,
      expires_at   TIMESTAMPTZ NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
    CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
    CREATE INDEX idx_password_reset_tokens_used_at ON password_reset_tokens(used_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_password_reset_tokens_used_at;
    DROP INDEX IF EXISTS idx_password_reset_tokens_expires_at;
    DROP INDEX IF EXISTS idx_password_reset_tokens_token_hash;
    DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;
    DROP TABLE IF EXISTS password_reset_tokens;
  `);
};
