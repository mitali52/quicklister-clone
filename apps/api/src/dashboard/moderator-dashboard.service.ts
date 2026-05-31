import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  MODERATOR_DASHBOARD_REPOSITORY,
  type IModeratorDashboardRepository,
} from './interfaces/moderator-dashboard-repository.interface';
import type { ModeratorDashboard } from './domain/moderator-dashboard';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ModeratorDashboardService {
  constructor(
    @Inject(MODERATOR_DASHBOARD_REPOSITORY)
    private readonly repo: IModeratorDashboardRepository,
  ) {}

  async getDashboard(page?: number, limit?: number): Promise<ModeratorDashboard> {
    try {
      return await this.repo.getDashboard(page ?? DEFAULT_PAGE, limit ?? DEFAULT_LIMIT);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load moderator dashboard');
    }
  }
}
