import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserDashboard, ListingStats } from '../domain/dashboard';
import type { User } from '../../users/domain/user';
import type { Listing } from '../../listings/domain/listing';

export class UserProfileDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() fullName: string;
  @ApiPropertyOptional({ nullable: true }) phoneNumber: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl: string | null;
  @ApiPropertyOptional({ nullable: true }) addressLine1: string | null;
  @ApiPropertyOptional({ nullable: true }) addressLine2: string | null;
  @ApiPropertyOptional({ nullable: true }) city: string | null;
  @ApiPropertyOptional({ nullable: true }) county: string | null;
  @ApiPropertyOptional({ nullable: true }) postcode: string | null;
  @ApiProperty() emailVerified: boolean;
  @ApiProperty() nrlaMember: boolean;
  @ApiProperty() createdAt: string;

  static fromDomain(user: User): UserProfileDto {
    const dto = new UserProfileDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.phoneNumber = user.phoneNumber;
    dto.avatarUrl = user.avatarUrl;
    dto.addressLine1 = user.addressLine1;
    dto.addressLine2 = user.addressLine2;
    dto.city = user.city;
    dto.county = user.county;
    dto.postcode = user.postcode;
    dto.emailVerified = user.emailVerified;
    dto.nrlaMember = user.nrlaMember;
    dto.createdAt = user.createdAt.toISOString();
    return dto;
  }
}

export class ListingStatsDto {
  @ApiProperty() totalListings: number;
  @ApiProperty() draftListings: number;
  @ApiProperty() pendingListings: number;
  @ApiProperty() approvedListings: number;
  @ApiProperty() rejectedListings: number;

  static fromDomain(stats: ListingStats): ListingStatsDto {
    const dto = new ListingStatsDto();
    dto.totalListings = stats.totalListings;
    dto.draftListings = stats.draftListings;
    dto.pendingListings = stats.pendingListings;
    dto.approvedListings = stats.approvedListings;
    dto.rejectedListings = stats.rejectedListings;
    return dto;
  }
}

export class RecentListingDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() status: string;
  @ApiProperty() listingType: string;
  @ApiProperty() propertyType: string;
  @ApiProperty() city: string;
  @ApiProperty() postcode: string;
  @ApiPropertyOptional({ nullable: true }) askingPrice: number | null;
  @ApiPropertyOptional({ nullable: true }) monthlyRent: number | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;

  static fromDomain(listing: Listing): RecentListingDto {
    const dto = new RecentListingDto();
    dto.id = listing.id;
    dto.title = listing.title;
    dto.status = listing.status;
    dto.listingType = listing.listingType;
    dto.propertyType = listing.propertyType;
    dto.city = listing.city;
    dto.postcode = listing.postcode;
    dto.askingPrice = listing.askingPrice;
    dto.monthlyRent = listing.monthlyRent;
    dto.createdAt = listing.createdAt.toISOString();
    dto.updatedAt = listing.updatedAt.toISOString();
    return dto;
  }
}

export class UserDashboardResponseDto {
  @ApiProperty({ type: UserProfileDto }) profile: UserProfileDto;
  @ApiProperty({ type: ListingStatsDto }) stats: ListingStatsDto;
  @ApiProperty({ type: [RecentListingDto] }) recentListings: RecentListingDto[];
  @ApiProperty() unreadNotifications: number;

  static fromDomain(dashboard: UserDashboard): UserDashboardResponseDto {
    const dto = new UserDashboardResponseDto();
    dto.profile = UserProfileDto.fromDomain(dashboard.profile);
    dto.stats = ListingStatsDto.fromDomain(dashboard.stats);
    dto.recentListings = dashboard.recentListings.map((l) => RecentListingDto.fromDomain(l));
    dto.unreadNotifications = dashboard.unreadNotifications;
    return dto;
  }
}
