export const AUDIT_ENTITY_TYPES = [
  'user',
  'role',
  'listing',
  'category',
  'organization',
  'notification',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'login',
  'logout',
  'block',
  'unblock',
  'assign_role',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: string;
  userId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface CreateAuditLogData {
  userId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  userId?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
}

export interface PaginatedAuditLogResult {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestAuditContext {
  ipAddress: string | null;
  userAgent: string | null;
}
