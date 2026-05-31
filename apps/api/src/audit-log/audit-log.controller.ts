import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditLogService } from './audit-log.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';
import { AuditLogListResponseDto } from './dto/audit-log-response.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List application audit logs (admin only)' })
  @ApiResponse({ status: 200, type: AuditLogListResponseDto })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async listLogs(@Query() dto: ListAuditLogsDto): Promise<AuditLogListResponseDto> {
    const result = await this.auditLogService.listLogs({
      userId: dto.userId,
      entityType: dto.entityType,
      action: dto.action,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
      page: dto.page,
      limit: dto.limit,
    });
    return AuditLogListResponseDto.fromDomain(result);
  }
}
