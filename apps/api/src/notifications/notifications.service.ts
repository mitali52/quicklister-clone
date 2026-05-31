import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  NOTIFICATIONS_REPOSITORY,
  type INotificationsRepository,
} from './interfaces/notifications-repository.interface';
import type {
  CreateNotificationData,
  Notification,
  NotificationFilters,
  PaginatedNotificationResult,
} from './domain/notification';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repo: INotificationsRepository,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    try {
      return await this.repo.create(data);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async listNotifications(
    userId: string,
    filters: Partial<NotificationFilters>,
  ): Promise<PaginatedNotificationResult> {
    try {
      return await this.repo.findByUserId(userId, {
        ...filters,
        page: filters.page ?? DEFAULT_PAGE,
        limit: filters.limit ?? DEFAULT_LIMIT,
      });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve notifications');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.repo.countUnread(userId);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to count unread notifications');
    }
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.findOwnedOrFail(notificationId, userId);

    if (notification.isRead) return; // idempotent — already read, no-op

    try {
      await this.repo.markRead(notificationId);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to mark notification as read');
    }
  }

  async markAllRead(userId: string): Promise<void> {
    try {
      await this.repo.markAllRead(userId);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.findOwnedOrFail(notificationId, userId);

    try {
      await this.repo.delete(notificationId);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }

  private async findOwnedOrFail(notificationId: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.repo.findById(notificationId);
      if (!notification) {
        throw new NotFoundException(`Notification ${notificationId} not found`);
      }
      if (notification.userId !== userId) {
        throw new ForbiddenException('You do not own this notification');
      }
      return notification;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve notification');
    }
  }
}
