import { type User, type CreateUserData, type UpdateUserData } from '../domain/user';

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

export interface IUsersRepository {
  findAll(opts: PaginationOpts): Promise<PaginatedResult<User>>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  updateAvatar(id: string, avatarUrl: string): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
