/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP EXTENSION IF EXISTS "pgcrypto";`);
};
