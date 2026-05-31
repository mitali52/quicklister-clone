import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/**
 * Thin facade that translates domain events into persisted notifications.
 * Future extension points: connect to WebSocket gateway, email queue, or
 * push notification provider by injecting additional services here.
 *
 * Other modules should import NotificationsModule and inject this service
 * to trigger notifications without coupling to the repository directly.
 */
@Injectable()
export class NotificationEventService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyListingApproved(
    userId: string,
    listingId: string,
    listingTitle: string,
  ): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'listing_approved',
      title: 'Listing approved',
      message: `Your listing "${listingTitle}" has been approved and is now live.`,
      metadata: { listingId },
    });
  }

  async notifyListingRejected(
    userId: string,
    listingId: string,
    listingTitle: string,
    reason?: string,
  ): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'listing_rejected',
      title: 'Listing rejected',
      message: `Your listing "${listingTitle}" was not approved. Please review and resubmit.`,
      metadata: { listingId, reason: reason ?? null },
    });
  }

  async notifyListingSubmitted(userId: string, listingId: string): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'listing_submitted',
      title: 'Listing submitted for review',
      message: 'Your listing has been submitted and is awaiting moderator review.',
      metadata: { listingId },
    });
  }

  async notifyOrganizationApproved(
    userId: string,
    organizationId: string,
    organizationName: string,
  ): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'organization_approved',
      title: 'Organisation approved',
      message: `Your organisation "${organizationName}" has been approved.`,
      metadata: { organizationId },
    });
  }

  async notifyOrganizationRejected(
    userId: string,
    organizationId: string,
    organizationName: string,
  ): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'organization_rejected',
      title: 'Organisation rejected',
      message: `Your organisation "${organizationName}" was not approved.`,
      metadata: { organizationId },
    });
  }

  async notifyUserBlocked(userId: string): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'user_blocked',
      title: 'Account suspended',
      message: 'Your account has been suspended. Please contact support for assistance.',
      metadata: {},
    });
  }

  async notifyUserUnblocked(userId: string): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'user_unblocked',
      title: 'Account reinstated',
      message: 'Your account has been reinstated and is now active.',
      metadata: {},
    });
  }

  async notifyPasswordChanged(userId: string): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'password_changed',
      title: 'Password changed',
      message: 'Your password was changed. If this was not you, contact support immediately.',
      metadata: {},
    });
  }

  async notifySystem(
    userId: string,
    title: string,
    message: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.notificationsService.create({
      userId,
      type: 'system',
      title,
      message,
      metadata,
    });
  }
}
