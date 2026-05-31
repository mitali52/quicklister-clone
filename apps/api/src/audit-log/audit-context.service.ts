import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestAuditContext } from './domain/audit-log';

const EMPTY_CONTEXT: RequestAuditContext = { ipAddress: null, userAgent: null };

/**
 * Propagates per-request HTTP context (IP, user-agent) through async call chains
 * without making services request-scoped.
 *
 * Seeded once per request by AuditContextInterceptor; read by AuditLogService.log().
 */
@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<RequestAuditContext>();

  run<T>(context: RequestAuditContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  get(): RequestAuditContext {
    return this.storage.getStore() ?? EMPTY_CONTEXT;
  }
}
