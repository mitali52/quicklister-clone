import { Injectable, Inject } from '@nestjs/common';
import { type Pool, type PoolClient } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, transaction, handleDbError } from '../database/helpers/query.helper';
import {
  type IUsersRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/users-repository.interface';
import { type User, type CreateUserData, type UpdateUserData } from './domain/user';

interface UserRow {
  id: string;
  role_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  email_verified: boolean;
  nrla_member: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function toDomain(row: UserRow): User {
  return {
    id: row.id,
    roleId: row.role_id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    avatarUrl: row.avatar_url,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    county: row.county,
    postcode: row.postcode,
    emailVerified: row.email_verified,
    nrlaMember: row.nrla_member,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<User>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    try {
      const [rows, countResult] = await Promise.all([
        this.pool.query<UserRow>(
          'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset],
        ),
        this.pool.query<{ count: string }>(
          'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL',
        ),
      ]);

      return {
        data: rows.rows.map(toDomain),
        total: Number.parseInt(countResult.rows[0]?.count ?? '0', 10),
        page,
        limit,
      };
    } catch (err) {
      handleDbError(err, 'UsersRepository.findAll');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const row = await queryOne<UserRow>(
        this.pool,
        'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'UsersRepository.findById');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const row = await queryOne<UserRow>(
        this.pool,
        'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'UsersRepository.findByEmail');
    }
  }

  async create(data: CreateUserData): Promise<User> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<UserRow>(
          `INSERT INTO users (role_id, email, password_hash, full_name, phone_number)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [data.roleId, data.email, data.passwordHash, data.fullName, data.phoneNumber ?? null],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Insert returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'UsersRepository.create');
      }
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<UserRow>(
          `UPDATE users
           SET full_name     = COALESCE($1, full_name),
               phone_number  = COALESCE($2, phone_number),
               address_line1 = COALESCE($3, address_line1),
               address_line2 = COALESCE($4, address_line2),
               city          = COALESCE($5, city),
               county        = COALESCE($6, county),
               postcode      = COALESCE($7, postcode),
               updated_at    = NOW()
           WHERE id = $8 AND deleted_at IS NULL
           RETURNING *`,
          [
            data.fullName ?? null,
            data.phoneNumber ?? null,
            data.addressLine1 ?? null,
            data.addressLine2 ?? null,
            data.city ?? null,
            data.county ?? null,
            data.postcode ?? null,
            id,
          ],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'UsersRepository.update');
      }
    });
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        const result = await client.query<UserRow>(
          `UPDATE users
           SET avatar_url = $1, updated_at = NOW()
           WHERE id = $2 AND deleted_at IS NULL
           RETURNING *`,
          [avatarUrl, id],
        );
        const row = result.rows[0];
        if (!row) throw new Error('Update returned no row');
        return toDomain(row);
      } catch (err) {
        handleDbError(err, 'UsersRepository.updateAvatar');
      }
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        await client.query(
          `UPDATE users
           SET password_hash = $1, updated_at = NOW()
           WHERE id = $2 AND deleted_at IS NULL`,
          [passwordHash, id],
        );
      } catch (err) {
        handleDbError(err, 'UsersRepository.updatePassword');
      }
    });
  }

  async softDelete(id: string): Promise<void> {
    return transaction(this.pool, async (client: PoolClient) => {
      try {
        await client.query(
          'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
          [id],
        );
      } catch (err) {
        handleDbError(err, 'UsersRepository.softDelete');
      }
    });
  }
}
