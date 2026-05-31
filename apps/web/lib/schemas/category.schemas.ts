import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateCategorySchema = z.object({
  parentId: z.string().uuid('Must be a valid UUID').optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(120, 'Slug must be at most 120 characters')
    .regex(slugPattern, 'Slug must be lowercase letters, numbers and hyphens (e.g. residential-sales)'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateCategorySchema = z.object({
  parentId: z.string().uuid('Must be a valid UUID').optional(),
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(slugPattern, 'Slug must be lowercase letters, numbers and hyphens')
    .optional(),
  description: z.string().max(1000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
