import type { Category, CreateCategoryData, UpdateCategoryData } from '../domain/category';

export interface ICategoriesRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findChildren(parentId: string): Promise<Category[]>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}

export const CATEGORIES_REPOSITORY = Symbol('CATEGORIES_REPOSITORY');
