import { z } from 'zod';

const slug = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  slug,
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional().or(z.literal('')),
  logoUrl: z.string().url('Must be a valid URL').max(2000).optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').max(2000).optional().or(z.literal('')),
});

export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  slug: slug.optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  logoUrl: z.string().url('Must be a valid URL').max(2000).optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').max(2000).optional().or(z.literal('')),
});

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
