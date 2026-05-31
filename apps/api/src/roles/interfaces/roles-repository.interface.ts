import { type Role } from '../domain/role';

export interface IRolesRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
}

export const ROLES_REPOSITORY = Symbol('ROLES_REPOSITORY');
