import { type Pool } from 'pg';
import { hashPassword } from '../../common/helpers/crypto.helper';

interface UserSeed {
  email: string;
  fullName: string;
  roleName: string;
  passwordEnvKey: string;
  defaultPassword: string;
}

const users: UserSeed[] = [
  {
    email: 'admin@quicklister.co.uk',
    fullName: 'Platform Admin',
    roleName: 'admin',
    passwordEnvKey: 'SEED_ADMIN_PASSWORD',
    defaultPassword: 'Admin@dev123',
  },
  {
    email: 'moderator@quicklister.co.uk',
    fullName: 'Platform Moderator',
    roleName: 'moderator',
    passwordEnvKey: 'SEED_MODERATOR_PASSWORD',
    defaultPassword: 'Moderator@dev123',
  },
  {
    email: 'user@quicklister.co.uk',
    fullName: 'Demo User',
    roleName: 'user',
    passwordEnvKey: 'SEED_USER_PASSWORD',
    defaultPassword: 'User@dev123',
  },
];

export async function seedUsers(pool: Pool): Promise<void> {
  for (const user of users) {
    const roleResult = await pool.query<{ id: string }>(
      'SELECT id FROM roles WHERE name = $1',
      [user.roleName],
    );

    const role = roleResult.rows[0];
    if (!role) {
      throw new Error(
        `Role "${user.roleName}" not found — run seedRoles() before seedUsers()`,
      );
    }

    const password = process.env[user.passwordEnvKey] ?? user.defaultPassword;
    const passwordHash = await hashPassword(password);

    await pool.query(
      `INSERT INTO users (role_id, email, password_hash, full_name, email_verified)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE
         SET role_id       = EXCLUDED.role_id,
             full_name     = EXCLUDED.full_name,
             email_verified = TRUE,
             updated_at    = NOW()`,
      [role.id, user.email, passwordHash, user.fullName],
    );
  }

  console.log(`Seeded ${users.length} users.`);
}
