/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE role_permissions (
      role_id       UUID        NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id  UUID        NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
    CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_role_permissions_permission_id;
    DROP INDEX IF EXISTS idx_role_permissions_role_id;
    DROP TABLE IF EXISTS role_permissions;
  `);
};
