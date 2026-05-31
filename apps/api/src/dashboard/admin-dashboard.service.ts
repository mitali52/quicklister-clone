import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { AdminDashboard } from './domain/admin-dashboard';

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async getDashboard(): Promise<AdminDashboard> {
    try {
      // getListingStats(null) returns platform-wide stats.
      // moderation.pendingReviews is derived from listingStats.pendingListings
      // so no additional query is needed.
      const [listingStats, userStats, orgStats, systemStats] = await Promise.all([
        this.repo.getListingStats(null),
        this.repo.getPlatformUserStats(),
        this.repo.getPlatformOrganizationStats(),
        this.repo.getPlatformSystemStats(),
      ]);

      return {
        users: userStats,
        organizations: orgStats,
        listings: listingStats,
        moderation: { pendingReviews: listingStats.pendingListings },
        system: systemStats,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load admin dashboard');
    }
  }
}
