import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import {
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List the authenticated user\'s notifications' })
  @ApiResponse({ status: 200, type: NotificationListResponseDto })
  async listNotifications(
    @Query() dto: ListNotificationsDto,
    @CurrentUser() user: AuthUser,
  ): Promise<NotificationListResponseDto> {
    const result = await this.notificationsService.listNotifications(user.id, {
      type: dto.type,
      isRead: dto.isRead,
      page: dto.page,
      limit: dto.limit,
    });
    return NotificationListResponseDto.fromDomain(result);
  }

  // Must be declared before /:id routes to prevent "unread-count" matching as a UUID param
  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread notifications for the authenticated user' })
  @ApiResponse({ status: 200, type: UnreadCountResponseDto })
  async getUnreadCount(@CurrentUser() user: AuthUser): Promise<UnreadCountResponseDto> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return UnreadCountResponseDto.of(count);
  }

  // Must be declared before /:id/read to prevent "read-all" being matched as a UUID param on PATCH
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read for the authenticated user' })
  @ApiResponse({ status: 204, description: 'All notifications marked as read' })
  async markAllRead(@CurrentUser() user: AuthUser): Promise<void> {
    await this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Not your notification' })
  async markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.notificationsService.markRead(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Not your notification' })
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.notificationsService.deleteNotification(id, user.id);
  }
}
