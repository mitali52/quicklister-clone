import type {
  CreateNotificationData,
  Notification,
  NotificationFilters,
  PaginatedNotificationResult,
} from '../domain/notification';

export interface INotificationsRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  findByUserId(userId: string, filters: NotificationFilters): Promise<PaginatedNotificationResult>;
  findById(id: string): Promise<Notification | null>;
  countUnread(userId: string): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export const NOTIFICATIONS_REPOSITORY = Symbol('NOTIFICATIONS_REPOSITORY');
