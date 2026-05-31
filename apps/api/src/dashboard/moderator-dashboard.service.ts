import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { ModeratorDashboard } from './domain/moderator-dashboard';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ModeratorDashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async getDashboard(page?: number, limit?: number): Promise<ModeratorDashboard> {
    try {
      const resolvedPage = page ?? DEFAULT_PAGE;
      const resolvedLimit = limit ?? DEFAULT_LIMIT;

      const [todayStats, pendingCount, recentReviews] = await Promise.all([
        this.repo.getTodayReviewStats(),
        this.repo.getPendingReviewCount(),
        this.repo.getRecentReviews(resolvedPage, resolvedLimit),
      ]);

      return {
        reviewStats: {
          pendingReviews: pendingCount,
          approvedToday: todayStats.approvedToday,
          rejectedToday: todayStats.rejectedToday,
        },
        queueStats: { listingsWaiting: pendingCount },
        recentReviews,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load moderator dashboard');
    }
  }
}
