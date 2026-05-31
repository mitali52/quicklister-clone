import type { AdminDashboard } from '../domain/admin-dashboard';

export interface IAdminDashboardRepository {
  getDashboard(): Promise<AdminDashboard>;
}

export const ADMIN_DASHBOARD_REPOSITORY = Symbol('ADMIN_DASHBOARD_REPOSITORY');
