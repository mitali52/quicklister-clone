import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { AUDIT_LOG_REPOSITORY } from './interfaces/audit-log-repository.interface';
import { AuditLogRepository } from './audit-log.repository';
import { AuditContextService } from './audit-context.service';
import { AuditContextInterceptor } from './interceptors/audit-context.interceptor';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    // Register the interceptor globally via APP_INTERCEPTOR so every route
    // benefits from request context propagation without per-module setup.
    { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
    AuditContextService,
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepository },
    AuditLogService,
  ],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
export class AuditLogModule {}
