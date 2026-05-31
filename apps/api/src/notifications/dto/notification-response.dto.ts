import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Notification, NotificationType, PaginatedNotificationResult } from '../domain/notification';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  type!: NotificationType;

  @ApiProperty()
  metadata!: Record<string, unknown>;

  @ApiProperty()
  isRead!: boolean;

  @ApiPropertyOptional({ nullable: true })
  readAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(n: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = n.id;
    dto.userId = n.userId;
    dto.title = n.title;
    dto.message = n.message;
    dto.type = n.type;
    dto.metadata = n.metadata;
    dto.isRead = n.isRead;
    dto.readAt = n.readAt;
    dto.createdAt = n.createdAt;
    dto.updatedAt = n.updatedAt;
    return dto;
  }
}

class NotificationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data!: NotificationResponseDto[];

  @ApiProperty({ type: NotificationMetaDto })
  meta!: NotificationMetaDto;

  static fromDomain(result: PaginatedNotificationResult): NotificationListResponseDto {
    const dto = new NotificationListResponseDto();
    dto.data = result.items.map(NotificationResponseDto.fromDomain);
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}

export class UnreadCountResponseDto {
  @ApiProperty()
  count!: number;

  static of(count: number): UnreadCountResponseDto {
    const dto = new UnreadCountResponseDto();
    dto.count = count;
    return dto;
  }
}
