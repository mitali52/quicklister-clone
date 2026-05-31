export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CreateCategoryData {
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  parentId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
}
