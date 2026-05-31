'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE admin_audit_logs (
      id            UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      action        TEXT        NOT NULL,
      resource_type TEXT        NOT NULL,
      resource_id   UUID        NOT NULL,
      metadata      JSONB       NOT NULL DEFAULT '{}',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_admin_audit_logs_admin_id      ON admin_audit_logs(admin_id);
    CREATE INDEX idx_admin_audit_logs_resource      ON admin_audit_logs(resource_type, resource_id);
    CREATE INDEX idx_admin_audit_logs_created_at    ON admin_audit_logs(created_at DESC);
    CREATE INDEX idx_admin_audit_logs_action        ON admin_audit_logs(action);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_admin_audit_logs_action;
    DROP INDEX IF EXISTS idx_admin_audit_logs_created_at;
    DROP INDEX IF EXISTS idx_admin_audit_logs_resource;
    DROP INDEX IF EXISTS idx_admin_audit_logs_admin_id;
    DROP TABLE IF EXISTS admin_audit_logs;
  `);
};
