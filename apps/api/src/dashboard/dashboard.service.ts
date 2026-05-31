import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { UserDashboard } from './domain/dashboard';

const RECENT_LISTINGS_LIMIT = 5;

@Injectable()
export class UserDashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async getUserDashboard(userId: string): Promise<UserDashboard> {
    try {
      // All four queries run concurrently — profile is checked after resolution
      // to avoid a sequential round-trip before fetching related data.
      const [profile, stats, recentListings, unreadNotifications] = await Promise.all([
        this.repo.getUserProfile(userId),
        this.repo.getListingStats(userId),
        this.repo.getRecentListings(userId, RECENT_LISTINGS_LIMIT),
        this.repo.getUnreadNotificationCount(userId),
      ]);

      if (!profile) throw new NotFoundException(`User ${userId} not found`);

      return { profile, stats, recentListings, unreadNotifications };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load user dashboard');
    }
  }
}

export { UserDashboardService as DashboardService };
