import type { Permission } from '../domain/permission';

export interface IPermissionsRepository {
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
}

export const PERMISSIONS_REPOSITORY = Symbol('PERMISSIONS_REPOSITORY');
