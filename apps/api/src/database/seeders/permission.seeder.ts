import { type Pool } from 'pg';

interface PermissionSeed {
  name: string;
  description: string;
}

const permissions: PermissionSeed[] = [
  { name: 'user:read', description: 'View user profile and account data.' },
  {
    name: 'user:update',
    description: 'Update user profile and account details.',
  },
  { name: 'role:read', description: 'View available roles and role metadata.' },
  { name: 'permission:read', description: 'View available permissions.' },
  { name: 'listing:create', description: 'Create a draft listing.' },
  { name: 'listing:read', description: 'View listing details.' },
  { name: 'listing:update', description: 'Edit a draft listing.' },
  { name: 'listing:submit', description: 'Submit a listing for review.' },
  { name: 'listing:approve', description: 'Approve a listing review.' },
  { name: 'listing:publish', description: 'Publish an approved listing.' },
  { name: 'listing:archive', description: 'Archive an existing listing.' },
  { name: 'listing:delete', description: 'Soft-delete a listing.' },
  { name: 'admin:access', description: 'Access admin-only screens and APIs.' },
];

export async function seedPermissions(pool: Pool): Promise<void> {
  for (const permission of permissions) {
    await pool.query(
      `
      INSERT INTO permissions (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE
        SET description = EXCLUDED.description,
            updated_at  = NOW()
      `,
      [permission.name, permission.description],
    );
  }

  console.log(`Seeded ${permissions.length} permissions.`);
}
