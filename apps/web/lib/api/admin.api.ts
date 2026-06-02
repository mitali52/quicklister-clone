import { apiGet, apiPatch, apiPost } from './client';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function buildQuery<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : '';
}

export interface AdminPlatformActivity {
  totalUsers: number;
  totalListings: number;
  pendingReviews: number;
  publishedListings: number;
  totalOrganizations: number;
  recentSignups: number;
  recentListings: number;
  recentReviews: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  emailVerified: boolean;
  createdAt: string;
  suspended: boolean;
  suspendedAt: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  phoneNumber: string | null;
  avatarUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  nrlaMember: boolean;
  updatedAt: string;
  listingCount: number;
  organizationCount: number;
}

export interface AdminUserListResponse {
  data: AdminUserListItem[];
  meta: PaginationMeta;
}

export interface AdminOrganizationListItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  slug: string;
  listingCount: number;
  createdAt: string;
}

export interface AdminOrganizationDetail extends AdminOrganizationListItem {
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  updatedAt: string;
}

export interface AdminOrganizationListResponse {
  data: AdminOrganizationListItem[];
  meta: PaginationMeta;
}

export interface AdminListingListItem {
  id: string;
  userId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  listingType: string;
  propertyType: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  city: string;
  postcode: string;
  askingPrice: number | null;
  monthlyRent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListingDetail extends AdminListingListItem {
  description: string | null;
  addressLine1: string;
  addressLine2: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  deletedAt: string | null;
  mediaCount: number;
}

export interface AdminListingListResponse {
  data: AdminListingListItem[];
  meta: PaginationMeta;
}

export interface AdminAuditLogItem {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminAuditLogResponse {
  data: AdminAuditLogItem[];
  meta: PaginationMeta;
}

export interface AdminUserListQuery {
  search?: string;
  roleName?: string;
  suspended?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminOrganizationListQuery {
  search?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
}

export interface AdminListingListQuery {
  search?: string;
  status?: string;
  listingType?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface AdminAuditLogListQuery {
  adminId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export interface AdminUpdateListingStatusData {
  status: 'draft' | 'pending_review' | 'published' | 'archived';
}

export const getAdminPlatformActivityApi = (): Promise<AdminPlatformActivity> =>
  apiGet<AdminPlatformActivity>('/admin/activity');

export const getAdminUsersApi = (query: AdminUserListQuery = {}): Promise<AdminUserListResponse> =>
  apiGet<AdminUserListResponse>(`/admin/users${buildQuery(query)}`);

export const getAdminUserApi = (id: string): Promise<AdminUserDetail> =>
  apiGet<AdminUserDetail>(`/admin/users/${id}`);

export const suspendAdminUserApi = (id: string): Promise<void> =>
  apiPost<void>(`/admin/users/${id}/suspend`);

export const activateAdminUserApi = (id: string): Promise<void> =>
  apiPost<void>(`/admin/users/${id}/activate`);

export const getAdminOrganizationsApi = (
  query: AdminOrganizationListQuery = {},
): Promise<AdminOrganizationListResponse> =>
  apiGet<AdminOrganizationListResponse>(`/admin/organizations${buildQuery(query)}`);

export const getAdminOrganizationApi = (id: string): Promise<AdminOrganizationDetail> =>
  apiGet<AdminOrganizationDetail>(`/admin/organizations/${id}`);

export const getAdminListingsApi = (
  query: AdminListingListQuery = {},
): Promise<AdminListingListResponse> =>
  apiGet<AdminListingListResponse>(`/admin/listings${buildQuery(query)}`);

export const getAdminListingApi = (id: string): Promise<AdminListingDetail> =>
  apiGet<AdminListingDetail>(`/admin/listings/${id}`);

export const updateAdminListingStatusApi = (
  id: string,
  data: AdminUpdateListingStatusData,
): Promise<void> => apiPatch<void>(`/admin/listings/${id}/status`, data);

export const getAdminAuditLogsApi = (
  query: AdminAuditLogListQuery = {},
): Promise<AdminAuditLogResponse> =>
  apiGet<AdminAuditLogResponse>(`/admin/audit-logs${buildQuery(query)}`);

export const getAdminDashboardActivityApi = getAdminPlatformActivityApi;
