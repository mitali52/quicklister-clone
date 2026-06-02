import { type Pool } from 'pg';

interface RolePermissionSeed {
  roleName: string;
  permissionNames: string[];
}

const rolePermissions: RolePermissionSeed[] = [
  {
    roleName: 'user',
    permissionNames: [
      'user:read',
      'user:update',
      'listing:create',
      'listing:read',
      'listing:update',
      'listing:submit',
      'listing:archive',
      'listing:delete',
    ],
  },
  {
    roleName: 'moderator',
    permissionNames: [
      'listing:read',
      'listing:approve',
      'listing:publish',
      'listing:archive',
      'admin:access',
    ],
  },
  {
    roleName: 'admin',
    permissionNames: [
      'user:read',
      'user:update',
      'role:read',
      'permission:read',
      'listing:create',
      'listing:read',
      'listing:update',
      'listing:submit',
      'listing:approve',
      'listing:publish',
      'listing:archive',
      'listing:delete',
      'admin:access',
    ],
  },
];

export async function seedRolePermissions(pool: Pool): Promise<void> {
  for (const assignment of rolePermissions) {
    const roleResult = await pool.query<{ id: string }>(
      'SELECT id FROM roles WHERE name = $1',
      [assignment.roleName],
    );
    const role = roleResult.rows[0];
    if (!role) {
      throw new Error(
        `Role "${assignment.roleName}" not found — run seedRoles() first`,
      );
    }

    for (const permissionName of assignment.permissionNames) {
      const permissionResult = await pool.query<{ id: string }>(
        'SELECT id FROM permissions WHERE name = $1',
        [permissionName],
      );
      const permission = permissionResult.rows[0];
      if (!permission) {
        throw new Error(
          `Permission "${permissionName}" not found — run seedPermissions() first`,
        );
      }

      await pool.query(
        `
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        ON CONFLICT (role_id, permission_id) DO UPDATE
          SET updated_at = NOW()
        `,
        [role.id, permission.id],
      );
    }
  }

  console.log(`Seeded role-permission mappings.`);
}
