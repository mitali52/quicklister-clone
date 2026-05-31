import { type Pool } from 'pg';

interface RoleSeed {
  name: string;
  description: string;
}

const roles: RoleSeed[] = [
  {
    name: 'admin',
    description: 'Full platform access — can approve listings, manage users, and access admin tooling.',
  },
  {
    name: 'moderator',
    description: 'Can review and approve/reject listing submissions and ownership verifications.',
  },
  {
    name: 'user',
    description: 'Standard authenticated user. Base role assigned on registration.',
  },
];

export async function seedRoles(pool: Pool): Promise<void> {
  for (const role of roles) {
    await pool.query(
      `
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE
        SET description = EXCLUDED.description,
            updated_at  = NOW()
      `,
      [role.name, role.description],
    );
  }

  console.log(`Seeded ${roles.length} roles.`);
}
