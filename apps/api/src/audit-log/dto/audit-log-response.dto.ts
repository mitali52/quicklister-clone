import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AuditAction, AuditEntityType, AuditLog, PaginatedAuditLogResult } from '../domain/audit-log';

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  entityType!: AuditEntityType;

  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  action!: AuditAction;

  @ApiPropertyOptional({ nullable: true })
  oldValues!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  newValues!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(log: AuditLog): AuditLogResponseDto {
    const dto = new AuditLogResponseDto();
    dto.id = log.id;
    dto.userId = log.userId;
    dto.entityType = log.entityType;
    dto.entityId = log.entityId;
    dto.action = log.action;
    dto.oldValues = log.oldValues;
    dto.newValues = log.newValues;
    dto.ipAddress = log.ipAddress;
    dto.userAgent = log.userAgent;
    dto.createdAt = log.createdAt;
    return dto;
  }
}

class AuditLogMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  data!: AuditLogResponseDto[];

  @ApiProperty({ type: AuditLogMetaDto })
  meta!: AuditLogMetaDto;

  static fromDomain(result: PaginatedAuditLogResult): AuditLogListResponseDto {
    const dto = new AuditLogListResponseDto();
    dto.data = result.items.map(AuditLogResponseDto.fromDomain);
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
