/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

/** @type {import('../interfaces/migration.interface').Migration} */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
  `);
};
