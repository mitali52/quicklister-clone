import { ApiProperty } from '@nestjs/swagger';
import type { ListingStats } from '../domain/dashboard';
import type {
  AdminDashboard,
  AdminUserStats,
  AdminOrganizationStats,
  AdminModerationStats,
  AdminSystemStats,
} from '../domain/admin-dashboard';

export class AdminUserStatsDto {
  @ApiProperty() totalUsers: number;
  @ApiProperty() activeUsers: number;
  @ApiProperty() blockedUsers: number;

  static fromDomain(stats: AdminUserStats): AdminUserStatsDto {
    const dto = new AdminUserStatsDto();
    dto.totalUsers = stats.totalUsers;
    dto.activeUsers = stats.activeUsers;
    dto.blockedUsers = stats.blockedUsers;
    return dto;
  }
}

export class AdminOrganizationStatsDto {
  @ApiProperty() totalOrganizations: number;
  @ApiProperty() activeOrganizations: number;

  static fromDomain(stats: AdminOrganizationStats): AdminOrganizationStatsDto {
    const dto = new AdminOrganizationStatsDto();
    dto.totalOrganizations = stats.totalOrganizations;
    dto.activeOrganizations = stats.activeOrganizations;
    return dto;
  }
}

export class AdminListingStatsDto {
  @ApiProperty() totalListings: number;
  @ApiProperty() draftListings: number;
  @ApiProperty() pendingListings: number;
  @ApiProperty() approvedListings: number;
  @ApiProperty() rejectedListings: number;

  static fromDomain(stats: ListingStats): AdminListingStatsDto {
    const dto = new AdminListingStatsDto();
    dto.totalListings = stats.totalListings;
    dto.draftListings = stats.draftListings;
    dto.pendingListings = stats.pendingListings;
    dto.approvedListings = stats.approvedListings;
    dto.rejectedListings = stats.rejectedListings;
    return dto;
  }
}

export class AdminModerationStatsDto {
  @ApiProperty() pendingReviews: number;

  static fromDomain(stats: AdminModerationStats): AdminModerationStatsDto {
    const dto = new AdminModerationStatsDto();
    dto.pendingReviews = stats.pendingReviews;
    return dto;
  }
}

export class AdminSystemStatsDto {
  @ApiProperty() notificationsSent: number;
  @ApiProperty() auditLogsGenerated: number;

  static fromDomain(stats: AdminSystemStats): AdminSystemStatsDto {
    const dto = new AdminSystemStatsDto();
    dto.notificationsSent = stats.notificationsSent;
    dto.auditLogsGenerated = stats.auditLogsGenerated;
    return dto;
  }
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminUserStatsDto }) users: AdminUserStatsDto;
  @ApiProperty({ type: AdminOrganizationStatsDto }) organizations: AdminOrganizationStatsDto;
  @ApiProperty({ type: AdminListingStatsDto }) listings: AdminListingStatsDto;
  @ApiProperty({ type: AdminModerationStatsDto }) moderation: AdminModerationStatsDto;
  @ApiProperty({ type: AdminSystemStatsDto }) system: AdminSystemStatsDto;

  static fromDomain(dashboard: AdminDashboard): AdminDashboardResponseDto {
    const dto = new AdminDashboardResponseDto();
    dto.users = AdminUserStatsDto.fromDomain(dashboard.users);
    dto.organizations = AdminOrganizationStatsDto.fromDomain(dashboard.organizations);
    dto.listings = AdminListingStatsDto.fromDomain(dashboard.listings);
    dto.moderation = AdminModerationStatsDto.fromDomain(dashboard.moderation);
    dto.system = AdminSystemStatsDto.fromDomain(dashboard.system);
    return dto;
  }
}
