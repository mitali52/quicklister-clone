import { InternalServerErrorException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import {
  AUDIT_LOG_REPOSITORY,
  type IAuditLogRepository,
} from './interfaces/audit-log-repository.interface';
import { AuditContextService } from './audit-context.service';
import type { AuditLog, PaginatedAuditLogResult } from './domain/audit-log';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: 'log-uuid-1',
    userId: 'user-uuid-1',
    entityType: 'listing',
    entityId: 'listing-uuid-1',
    action: 'create',
    oldValues: null,
    newValues: { title: 'Modern flat', status: 'draft' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  };
}

function buildPaginatedResult(
  overrides: Partial<PaginatedAuditLogResult> = {},
): PaginatedAuditLogResult {
  return {
    items: [buildAuditLog()],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeAuditContextService(
  ip: string | null = '10.0.0.1',
  ua: string | null = 'TestAgent/1.0',
): AuditContextService {
  const svc = new AuditContextService();
  jest.spyOn(svc, 'get').mockReturnValue({ ipAddress: ip, userAgent: ua });
  return svc;
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: jest.Mocked<IAuditLogRepository>;
  let auditContext: AuditContextService;

  const USER_ID = 'user-uuid-1';
  const ENTITY_ID = 'listing-uuid-1';

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    auditContext = makeAuditContextService();

    const providers = new Map([[AUDIT_LOG_REPOSITORY, repo]]);
    service = new AuditLogService(
      providers.get(AUDIT_LOG_REPOSITORY) as IAuditLogRepository,
      auditContext,
    );
  });

  // ── log ───────────────────────────────────────────────────────────────────

  describe('log', () => {
    it('persists an audit entry with context ip and user-agent', async () => {
      repo.create.mockResolvedValue(buildAuditLog());

      await service.log({
        userId: USER_ID,
        entityType: 'listing',
        entityId: ENTITY_ID,
        action: 'create',
        newValues: { title: 'Flat' },
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          entityType: 'listing',
          entityId: ENTITY_ID,
          action: 'create',
          newValues: { title: 'Flat' },
          ipAddress: '10.0.0.1',
          userAgent: 'TestAgent/1.0',
        }),
      );
    });

    it('defaults oldValues and newValues to null when not provided', async () => {
      repo.create.mockResolvedValue(buildAuditLog({ oldValues: null, newValues: null }));

      await service.log({ userId: USER_ID, entityType: 'user', entityId: USER_ID, action: 'login' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ oldValues: null, newValues: null }),
      );
    });

    it('propagates null ip and user-agent when no request context is available', async () => {
      jest.spyOn(auditContext, 'get').mockReturnValue({ ipAddress: null, userAgent: null });
      repo.create.mockResolvedValue(buildAuditLog());

      await service.log({ userId: USER_ID, entityType: 'user', entityId: USER_ID, action: 'logout' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: null, userAgent: null }),
      );
    });

    it('silently swallows repository errors — never propagates to caller', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      repo.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        service.log({ userId: USER_ID, entityType: 'listing', entityId: ENTITY_ID, action: 'delete' }),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AuditLog] Failed to write audit entry:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  // ── listLogs ──────────────────────────────────────────────────────────────

  describe('listLogs', () => {
    it('returns paginated results from the repository', async () => {
      const expected = buildPaginatedResult();
      repo.findAll.mockResolvedValue(expected);

      const result = await service.listLogs({});

      expect(result).toEqual(expected);
    });

    it('applies defaults page=1 and limit=20 when not supplied', async () => {
      repo.findAll.mockResolvedValue(buildPaginatedResult());

      await service.listLogs({});

      expect(repo.findAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
    });

    it('passes all filters through to the repository', async () => {
      repo.findAll.mockResolvedValue(buildPaginatedResult({ items: [] }));

      await service.listLogs({
        userId: USER_ID,
        entityType: 'listing',
        action: 'create',
        fromDate: '2026-01-01T00:00:00Z',
        toDate: '2026-01-31T23:59:59Z',
        page: 2,
        limit: 10,
      });

      expect(repo.findAll).toHaveBeenCalledWith({
        userId: USER_ID,
        entityType: 'listing',
        action: 'create',
        fromDate: '2026-01-01T00:00:00Z',
        toDate: '2026-01-31T23:59:59Z',
        page: 2,
        limit: 10,
      });
    });

    it('returns an empty list when no entries match the filters', async () => {
      repo.findAll.mockResolvedValue(buildPaginatedResult({ items: [], total: 0, totalPages: 0 }));

      const result = await service.listLogs({ action: 'delete' });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.findAll.mockRejectedValue(new InternalServerErrorException());

      await expect(service.listLogs({})).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('query timeout'));

      await expect(service.listLogs({})).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── typed helpers ─────────────────────────────────────────────────────────

  describe('typed helpers', () => {
    beforeEach(() => {
      repo.create.mockResolvedValue(buildAuditLog());
    });

    it('logListingCreated calls log with action=create and entityType=listing', async () => {
      await service.logListingCreated(USER_ID, ENTITY_ID, { title: 'Flat' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'create', entityType: 'listing', entityId: ENTITY_ID }),
      );
    });

    it('logListingApproved calls log with action=approve', async () => {
      await service.logListingApproved('reviewer-uuid', ENTITY_ID);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'approve', entityType: 'listing' }),
      );
    });

    it('logListingRejected includes reason in newValues', async () => {
      await service.logListingRejected('reviewer-uuid', ENTITY_ID, 'Photos too dark');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'reject',
          newValues: { reason: 'Photos too dark' },
        }),
      );
    });

    it('logUserBlocked calls log with action=block and entityType=user', async () => {
      await service.logUserBlocked('admin-uuid', USER_ID);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'block', entityType: 'user', entityId: USER_ID }),
      );
    });

    it('logUserUnblocked calls log with action=unblock', async () => {
      await service.logUserUnblocked('admin-uuid', USER_ID);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'unblock', entityType: 'user' }),
      );
    });

    it('logLogin calls log with action=login and entityType=user', async () => {
      await service.logLogin(USER_ID);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'login', entityType: 'user', userId: USER_ID }),
      );
    });

    it('logOrganizationUpdated includes old and new values', async () => {
      const old = { name: 'Old Corp' };
      const updated = { name: 'New Corp' };

      await service.logOrganizationUpdated(USER_ID, 'org-uuid-1', old, updated);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          entityType: 'organization',
          oldValues: old,
          newValues: updated,
        }),
      );
    });
  });
});
