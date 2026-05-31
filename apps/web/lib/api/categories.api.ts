import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CreateCategoryData {
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  parentId?: string;
  name?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
}

export const getCategoriesApi = (): Promise<Category[]> =>
  apiGet<Category[]>('/categories');

export const getCategoryTreeApi = (): Promise<CategoryTreeNode[]> =>
  apiGet<CategoryTreeNode[]>('/categories/tree');

export const getCategoryApi = (id: string): Promise<Category> =>
  apiGet<Category>(`/categories/${id}`);

export const createCategoryApi = (data: CreateCategoryData): Promise<Category> =>
  apiPost<Category>('/categories', data);

export const updateCategoryApi = (id: string, data: UpdateCategoryData): Promise<Category> =>
  apiPatch<Category>(`/categories/${id}`, data);

export const deleteCategoryApi = (id: string): Promise<void> =>
  apiDelete<void>(`/categories/${id}`);
