import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  ADMIN_DASHBOARD_REPOSITORY,
  type IAdminDashboardRepository,
} from './interfaces/admin-dashboard-repository.interface';
import type { AdminDashboard } from './domain/admin-dashboard';

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(ADMIN_DASHBOARD_REPOSITORY)
    private readonly repo: IAdminDashboardRepository,
  ) {}

  async getDashboard(): Promise<AdminDashboard> {
    try {
      return await this.repo.getDashboard();
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load admin dashboard');
    }
  }
}
