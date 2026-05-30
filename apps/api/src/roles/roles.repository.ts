import { Injectable, Inject } from '@nestjs/common';
import { type Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { queryOne, handleDbError } from '../database/helpers/query.helper';
import { type IRolesRepository } from './interfaces/roles-repository.interface';
import { type Role } from './domain/role';

interface RoleRow {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

function toDomain(row: RoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Role[]> {
    try {
      const result = await this.pool.query<RoleRow>(
        'SELECT * FROM roles ORDER BY name ASC',
      );
      return result.rows.map(toDomain);
    } catch (err) {
      handleDbError(err, 'RolesRepository.findAll');
    }
  }

  async findById(id: string): Promise<Role | null> {
    try {
      const row = await queryOne<RoleRow>(
        this.pool,
        'SELECT * FROM roles WHERE id = $1',
        [id],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'RolesRepository.findById');
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      const row = await queryOne<RoleRow>(
        this.pool,
        'SELECT * FROM roles WHERE name = $1',
        [name],
      );
      return row ? toDomain(row) : null;
    } catch (err) {
      handleDbError(err, 'RolesRepository.findByName');
    }
  }
}
