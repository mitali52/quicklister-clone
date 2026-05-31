export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface AdminOrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
}

export interface AdminListingStats {
  totalListings: number;
  draftListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
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
  listings: AdminListingStats;
  moderation: AdminModerationStats;
  system: AdminSystemStats;
}
