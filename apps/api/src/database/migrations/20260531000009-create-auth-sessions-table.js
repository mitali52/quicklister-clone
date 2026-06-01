/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE auth_sessions (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      jti              UUID        NOT NULL UNIQUE,
      family_id        UUID        NOT NULL,
      token_hash       TEXT        NOT NULL,
      expires_at       TIMESTAMPTZ NOT NULL,
      revoked_at       TIMESTAMPTZ,
      replaced_by_jti  UUID,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
    CREATE INDEX idx_auth_sessions_jti ON auth_sessions(jti);
    CREATE INDEX idx_auth_sessions_family_id ON auth_sessions(family_id);
    CREATE INDEX idx_auth_sessions_revoked_at ON auth_sessions(revoked_at);
    CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_auth_sessions_expires_at;
    DROP INDEX IF EXISTS idx_auth_sessions_revoked_at;
    DROP INDEX IF EXISTS idx_auth_sessions_family_id;
    DROP INDEX IF EXISTS idx_auth_sessions_jti;
    DROP INDEX IF EXISTS idx_auth_sessions_user_id;
    DROP TABLE IF EXISTS auth_sessions;
  `);
};
