'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TYPE audit_entity_type AS ENUM (
      'user',
      'role',
      'listing',
      'category',
      'organization',
      'notification'
    );

    CREATE TYPE audit_action AS ENUM (
      'create',
      'update',
      'delete',
      'approve',
      'reject',
      'login',
      'logout',
      'block',
      'unblock',
      'assign_role'
    );

    CREATE TABLE audit_logs (
      id          UUID              NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      entity_type audit_entity_type NOT NULL,
      entity_id   UUID              NOT NULL,
      action      audit_action      NOT NULL,
      old_values  JSONB,
      new_values  JSONB,
      ip_address  TEXT,
      user_agent  TEXT,
      created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_audit_logs_user_id            ON audit_logs(user_id);
    CREATE INDEX idx_audit_logs_entity             ON audit_logs(entity_type, entity_id);
    CREATE INDEX idx_audit_logs_action             ON audit_logs(action);
    CREATE INDEX idx_audit_logs_created_at         ON audit_logs(created_at DESC);
    CREATE INDEX idx_audit_logs_user_created_at    ON audit_logs(user_id, created_at DESC);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_audit_logs_user_created_at;
    DROP INDEX IF EXISTS idx_audit_logs_created_at;
    DROP INDEX IF EXISTS idx_audit_logs_action;
    DROP INDEX IF EXISTS idx_audit_logs_entity;
    DROP INDEX IF EXISTS idx_audit_logs_user_id;
    DROP TABLE IF EXISTS audit_logs;
    DROP TYPE IF EXISTS audit_action;
    DROP TYPE IF EXISTS audit_entity_type;
  `);
};
