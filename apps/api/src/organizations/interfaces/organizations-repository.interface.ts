import type { Organization, CreateOrganizationData, UpdateOrganizationData } from '../domain/organization';

export interface PaginationOpts {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrganizationsRepository {
  findAll(opts: PaginationOpts): Promise<PaginatedResult<Organization>>;
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByOwnerId(ownerId: string, opts: PaginationOpts): Promise<PaginatedResult<Organization>>;
  create(data: CreateOrganizationData): Promise<Organization>;
  update(id: string, data: UpdateOrganizationData): Promise<Organization>;
  softDelete(id: string): Promise<void>;
}

export const ORGANIZATIONS_REPOSITORY = Symbol('ORGANIZATIONS_REPOSITORY');
