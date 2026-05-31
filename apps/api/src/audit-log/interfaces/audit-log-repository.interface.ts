import type {
  AuditLog,
  AuditLogFilters,
  CreateAuditLogData,
  PaginatedAuditLogResult,
  RequestAuditContext,
} from '../domain/audit-log';

export interface IAuditLogRepository {
  create(data: CreateAuditLogData & RequestAuditContext): Promise<AuditLog>;
  findAll(filters: AuditLogFilters): Promise<PaginatedAuditLogResult>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');
