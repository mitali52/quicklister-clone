import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  type IAuditLogRepository,
} from './interfaces/audit-log-repository.interface';
import { AuditContextService } from './audit-context.service';
import type {
  AuditLog,
  AuditLogFilters,
  CreateAuditLogData,
  PaginatedAuditLogResult,
} from './domain/audit-log';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class AuditLogService {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly repo: IAuditLogRepository,
    private readonly auditContextService: AuditContextService,
  ) {}

  /**
   * Persist an audit log entry. Errors are caught and logged to stderr so that
   * a database failure here never propagates to the caller.
   *
   * IP address and user-agent are read automatically from the current
   * request context seeded by AuditContextInterceptor.
   */
  async log(data: CreateAuditLogData): Promise<void> {
    const { ipAddress, userAgent } = this.auditContextService.get();
    try {
      await this.repo.create({
        ...data,
        oldValues: data.oldValues ?? null,
        newValues: data.newValues ?? null,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      // Audit logging must never break the primary operation.
      console.error('[AuditLog] Failed to write audit entry:', err);
    }
  }

  async listLogs(filters: Partial<AuditLogFilters>): Promise<PaginatedAuditLogResult> {
    try {
      return await this.repo.findAll({
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve audit logs');
    }
  }

  // ── Typed helpers — remove duplication at call sites ─────────────────────

  async logUserUpdated(
    actorId: string,
    targetUserId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    return this.log({ userId: actorId, entityType: 'user', entityId: targetUserId, action: 'update', oldValues, newValues });
  }

  async logRoleAssigned(
    actorId: string,
    targetUserId: string,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    return this.log({ userId: actorId, entityType: 'role', entityId: targetUserId, action: 'assign_role', newValues });
  }

  async logListingCreated(userId: string, listingId: string, newValues: Record<string, unknown>): Promise<void> {
    return this.log({ userId, entityType: 'listing', entityId: listingId, action: 'create', newValues });
  }

  async logListingUpdated(
    userId: string,
    listingId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    return this.log({ userId, entityType: 'listing', entityId: listingId, action: 'update', oldValues, newValues });
  }

  async logListingApproved(reviewerId: string, listingId: string): Promise<void> {
    return this.log({ userId: reviewerId, entityType: 'listing', entityId: listingId, action: 'approve' });
  }

  async logListingRejected(reviewerId: string, listingId: string, reason?: string): Promise<void> {
    return this.log({ userId: reviewerId, entityType: 'listing', entityId: listingId, action: 'reject', newValues: reason ? { reason } : undefined });
  }

  async logOrganizationUpdated(
    userId: string,
    organizationId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    return this.log({ userId, entityType: 'organization', entityId: organizationId, action: 'update', oldValues, newValues });
  }

  async logUserBlocked(adminId: string, targetUserId: string): Promise<void> {
    return this.log({ userId: adminId, entityType: 'user', entityId: targetUserId, action: 'block' });
  }

  async logUserUnblocked(adminId: string, targetUserId: string): Promise<void> {
    return this.log({ userId: adminId, entityType: 'user', entityId: targetUserId, action: 'unblock' });
  }

  async logLogin(userId: string): Promise<void> {
    return this.log({ userId, entityType: 'user', entityId: userId, action: 'login' });
  }

  async logLogout(userId: string): Promise<void> {
    return this.log({ userId, entityType: 'user', entityId: userId, action: 'logout' });
  }
}
