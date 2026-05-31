import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrganizations {
  data: Organization[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const getMyOrganizationsApi = (page = 1, limit = 20): Promise<PaginatedOrganizations> =>
  apiGet<PaginatedOrganizations>(`/organizations/me?page=${page}&limit=${limit}`);

export const getOrganizationApi = (id: string): Promise<Organization> =>
  apiGet<Organization>(`/organizations/${id}`);

export const createOrganizationApi = (data: CreateOrganizationData): Promise<Organization> =>
  apiPost<Organization>('/organizations', data);

export const updateOrganizationApi = (
  id: string,
  data: UpdateOrganizationData,
): Promise<Organization> => apiPatch<Organization>(`/organizations/${id}`, data);

export const deleteOrganizationApi = (id: string): Promise<void> =>
  apiDelete<void>(`/organizations/${id}`);
