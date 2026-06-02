import 'dotenv/config';
import { Pool } from 'pg';
import { getDatabaseConfig } from '../database.config';
import { seedRoles } from './role.seeder';
import { seedPermissions } from './permission.seeder';
import { seedRolePermissions } from './role-permission.seeder';
import { seedUsers } from './user.seeder';

async function main(): Promise<void> {
  const config = getDatabaseConfig();
  const pool = new Pool({ connectionString: config.url });

  console.log('Seeding database…');

  try {
    await seedRoles(pool);
    await seedPermissions(pool);
    await seedRolePermissions(pool);
    await seedUsers(pool); // must run after seedRoles — looks up role IDs
    console.log('Done.');
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
