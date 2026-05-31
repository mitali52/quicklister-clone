'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getCategoriesApi,
  getCategoryTreeApi,
  getCategoryApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '@/lib/api/categories.api';

const ALL_CATEGORIES_KEY = ['categories'] as const;
const TREE_KEY = ['categories', 'tree'] as const;
const categoryKey = (id: string) => ['categories', id] as const;

export function useCategories() {
  return useQuery({
    queryKey: ALL_CATEGORIES_KEY,
    queryFn: () => getCategoriesApi(),
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: TREE_KEY,
    queryFn: () => getCategoryTreeApi(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKey(id),
    queryFn: () => getCategoryApi(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => createCategoryApi(data),
    onSuccess: (category) => {
      void queryClient.invalidateQueries({ queryKey: ALL_CATEGORIES_KEY });
      void queryClient.invalidateQueries({ queryKey: TREE_KEY });
      router.push(`/categories/${category.id}`);
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryData) => updateCategoryApi(id, data),
    onSuccess: (category) => {
      queryClient.setQueryData(categoryKey(id), category);
      void queryClient.invalidateQueries({ queryKey: ALL_CATEGORIES_KEY });
      void queryClient.invalidateQueries({ queryKey: TREE_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ALL_CATEGORIES_KEY });
      void queryClient.invalidateQueries({ queryKey: TREE_KEY });
      router.push('/categories');
    },
  });
}
