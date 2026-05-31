import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { AuditContextService } from '../audit-context.service';

/**
 * Global interceptor that seeds the AsyncLocalStorage audit context at the
 * start of every HTTP request. AuditLogService.log() reads from this context
 * to attach IP address and user-agent without needing them passed explicitly.
 */
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    const rawIp = req.headers['x-forwarded-for'];
    let forwardedIp: string | undefined;
    if (typeof rawIp === 'string') {
      forwardedIp = rawIp.split(',')[0]?.trim();
    } else if (Array.isArray(rawIp)) {
      forwardedIp = rawIp[0];
    }
    const ipAddress = forwardedIp ?? req.ip ?? null;

    const userAgent = req.headers['user-agent'] ?? null;

    // Wrap the route handler Observable inside the ALS context so that any
    // async operations (Promises created by await) in the request chain inherit it.
    return new Observable((subscriber) => {
      this.auditContextService.run({ ipAddress, userAgent }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
