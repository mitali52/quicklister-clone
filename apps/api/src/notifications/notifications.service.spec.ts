import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  NOTIFICATIONS_REPOSITORY,
  type INotificationsRepository,
} from './interfaces/notifications-repository.interface';
import type {
  Notification,
  PaginatedNotificationResult,
} from './domain/notification';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-uuid-1',
    userId: 'user-uuid-1',
    title: 'Listing approved',
    message: 'Your listing has been approved.',
    type: 'listing_approved',
    metadata: {},
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  };
}

function buildPaginatedResult(
  overrides: Partial<PaginatedNotificationResult> = {},
): PaginatedNotificationResult {
  return {
    items: [buildNotification()],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<INotificationsRepository>;

  const USER_ID = 'user-uuid-1';
  const OTHER_USER_ID = 'user-uuid-2';
  const NOTIF_ID = 'notif-uuid-1';

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      countUnread: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      delete: jest.fn(),
    };

    const providers = new Map([[NOTIFICATIONS_REPOSITORY, repo]]);
    service = new NotificationsService(
      providers.get(NOTIFICATIONS_REPOSITORY) as INotificationsRepository,
    );
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('persists and returns the new notification', async () => {
      const expected = buildNotification();
      repo.create.mockResolvedValue(expected);

      const result = await service.create({
        userId: USER_ID,
        type: 'listing_approved',
        title: 'Approved',
        message: 'Your listing is live.',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, type: 'listing_approved' }),
      );
      expect(result.id).toBe(expected.id);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.create.mockRejectedValue(new InternalServerErrorException());

      await expect(
        service.create({ userId: USER_ID, type: 'system', title: 'T', message: 'M' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.create.mockRejectedValue(new Error('DB timeout'));

      await expect(
        service.create({ userId: USER_ID, type: 'system', title: 'T', message: 'M' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── listNotifications ─────────────────────────────────────────────────────

  describe('listNotifications', () => {
    it('returns paginated notifications from the repository', async () => {
      const expected = buildPaginatedResult();
      repo.findByUserId.mockResolvedValue(expected);

      const result = await service.listNotifications(USER_ID, {});

      expect(result).toEqual(expected);
    });

    it('applies defaults page=1 and limit=20 when not supplied', async () => {
      repo.findByUserId.mockResolvedValue(buildPaginatedResult());

      await service.listNotifications(USER_ID, {});

      expect(repo.findByUserId).toHaveBeenCalledWith(USER_ID, expect.objectContaining({ page: 1, limit: 20 }));
    });

    it('passes type and isRead filters through to the repository', async () => {
      repo.findByUserId.mockResolvedValue(buildPaginatedResult({ items: [] }));

      await service.listNotifications(USER_ID, { type: 'system', isRead: false, page: 2, limit: 10 });

      expect(repo.findByUserId).toHaveBeenCalledWith(USER_ID, {
        type: 'system',
        isRead: false,
        page: 2,
        limit: 10,
      });
    });

    it('returns empty result when user has no notifications', async () => {
      repo.findByUserId.mockResolvedValue(buildPaginatedResult({ items: [], total: 0, totalPages: 0 }));

      const result = await service.listNotifications(USER_ID, {});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findByUserId.mockRejectedValue(new Error('connection lost'));

      await expect(service.listNotifications(USER_ID, {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── getUnreadCount ────────────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('returns the unread count from the repository', async () => {
      repo.countUnread.mockResolvedValue(5);

      const count = await service.getUnreadCount(USER_ID);

      expect(count).toBe(5);
      expect(repo.countUnread).toHaveBeenCalledWith(USER_ID);
    });

    it('returns 0 when all notifications are read', async () => {
      repo.countUnread.mockResolvedValue(0);

      const count = await service.getUnreadCount(USER_ID);

      expect(count).toBe(0);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.countUnread.mockRejectedValue(new Error('DB error'));

      await expect(service.getUnreadCount(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── markRead ──────────────────────────────────────────────────────────────

  describe('markRead', () => {
    it('marks the notification as read when the user owns it', async () => {
      repo.findById.mockResolvedValue(buildNotification({ id: NOTIF_ID, userId: USER_ID, isRead: false }));

      await service.markRead(NOTIF_ID, USER_ID);

      expect(repo.markRead).toHaveBeenCalledWith(NOTIF_ID);
    });

    it('is a no-op when notification is already read', async () => {
      repo.findById.mockResolvedValue(
        buildNotification({ id: NOTIF_ID, userId: USER_ID, isRead: true, readAt: new Date() }),
      );

      await service.markRead(NOTIF_ID, USER_ID);

      expect(repo.markRead).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the notification does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.markRead(NOTIF_ID, USER_ID)).rejects.toThrow(NotFoundException);
      expect(repo.markRead).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the notification belongs to another user', async () => {
      repo.findById.mockResolvedValue(buildNotification({ id: NOTIF_ID, userId: OTHER_USER_ID }));

      await expect(service.markRead(NOTIF_ID, USER_ID)).rejects.toThrow(ForbiddenException);
      expect(repo.markRead).not.toHaveBeenCalled();
    });

    it('wraps unexpected repository errors from markRead in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildNotification({ userId: USER_ID, isRead: false }));
      repo.markRead.mockRejectedValue(new Error('DB gone'));

      await expect(service.markRead(NOTIF_ID, USER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── markAllRead ───────────────────────────────────────────────────────────

  describe('markAllRead', () => {
    it('delegates to the repository with the correct user id', async () => {
      repo.markAllRead.mockResolvedValue(undefined);

      await service.markAllRead(USER_ID);

      expect(repo.markAllRead).toHaveBeenCalledWith(USER_ID);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.markAllRead.mockRejectedValue(new Error('timeout'));

      await expect(service.markAllRead(USER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── deleteNotification ────────────────────────────────────────────────────

  describe('deleteNotification', () => {
    it('deletes the notification when the user owns it', async () => {
      repo.findById.mockResolvedValue(buildNotification({ id: NOTIF_ID, userId: USER_ID }));

      await service.deleteNotification(NOTIF_ID, USER_ID);

      expect(repo.delete).toHaveBeenCalledWith(NOTIF_ID);
    });

    it('throws NotFoundException when the notification does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteNotification(NOTIF_ID, USER_ID)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the notification belongs to another user', async () => {
      repo.findById.mockResolvedValue(buildNotification({ id: NOTIF_ID, userId: OTHER_USER_ID }));

      await expect(service.deleteNotification(NOTIF_ID, USER_ID)).rejects.toThrow(ForbiddenException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('wraps unexpected repository errors from delete in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildNotification({ userId: USER_ID }));
      repo.delete.mockRejectedValue(new Error('FK violation'));

      await expect(service.deleteNotification(NOTIF_ID, USER_ID)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
