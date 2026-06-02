import type { ListingStats } from './dashboard';

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface AdminOrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
}

export interface AdminModerationStats {
  pendingReviews: number;
}

export interface AdminSystemStats {
  notificationsSent: number;
  auditLogsGenerated: number;
}

export interface AdminDashboard {
  users: AdminUserStats;
  organizations: AdminOrganizationStats;
  listings: ListingStats;
  moderation: AdminModerationStats;
  system: AdminSystemStats;
}
