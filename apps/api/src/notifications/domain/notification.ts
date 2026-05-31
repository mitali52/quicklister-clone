export const NOTIFICATION_TYPES = [
  'listing_approved',
  'listing_rejected',
  'listing_submitted',
  'organization_approved',
  'organization_rejected',
  'user_blocked',
  'user_unblocked',
  'password_changed',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedNotificationResult {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
