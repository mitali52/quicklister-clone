import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from './interfaces/dashboard-repository.interface';
import type { UserDashboard } from './domain/dashboard';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async getUserDashboard(userId: string): Promise<UserDashboard> {
    try {
      const dashboard = await this.repo.getUserDashboard(userId);
      if (!dashboard) throw new NotFoundException(`User ${userId} not found`);
      return dashboard;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load dashboard');
    }
  }
}
