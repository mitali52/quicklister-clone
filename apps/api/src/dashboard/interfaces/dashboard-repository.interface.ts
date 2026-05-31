import type { UserDashboard } from '../domain/dashboard';

export interface IDashboardRepository {
  getUserDashboard(userId: string): Promise<UserDashboard | null>;
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
