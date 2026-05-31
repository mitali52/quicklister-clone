import type { ModeratorDashboard } from '../domain/moderator-dashboard';

export interface IModeratorDashboardRepository {
  getDashboard(page: number, limit: number): Promise<ModeratorDashboard>;
}

export const MODERATOR_DASHBOARD_REPOSITORY = Symbol('MODERATOR_DASHBOARD_REPOSITORY');
