import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ModeratorDashboard,
  ReviewStats,
  QueueStats,
  RecentReview,
  PaginatedRecentReviews,
} from '../domain/moderator-dashboard';

export class ReviewStatsDto {
  @ApiProperty() pendingReviews: number;
  @ApiProperty() approvedToday: number;
  @ApiProperty() rejectedToday: number;

  static fromDomain(stats: ReviewStats): ReviewStatsDto {
    const dto = new ReviewStatsDto();
    dto.pendingReviews = stats.pendingReviews;
    dto.approvedToday = stats.approvedToday;
    dto.rejectedToday = stats.rejectedToday;
    return dto;
  }
}

export class QueueStatsDto {
  @ApiProperty() listingsWaiting: number;

  static fromDomain(stats: QueueStats): QueueStatsDto {
    const dto = new QueueStatsDto();
    dto.listingsWaiting = stats.listingsWaiting;
    return dto;
  }
}

export class RecentReviewDto {
  @ApiProperty() id: string;
  @ApiProperty() listingId: string;
  @ApiProperty() listingTitle: string;
  @ApiProperty() listingCity: string;
  @ApiProperty() listingPostcode: string;
  @ApiProperty({ enum: ['approved', 'rejected'] }) decision: string;
  @ApiPropertyOptional({ nullable: true }) notes: string | null;
  @ApiProperty() reviewerId: string;
  @ApiProperty() reviewerName: string;
  @ApiProperty() reviewerEmail: string;
  @ApiProperty() reviewedAt: string;

  static fromDomain(review: RecentReview): RecentReviewDto {
    const dto = new RecentReviewDto();
    dto.id = review.id;
    dto.listingId = review.listingId;
    dto.listingTitle = review.listingTitle;
    dto.listingCity = review.listingCity;
    dto.listingPostcode = review.listingPostcode;
    dto.decision = review.decision;
    dto.notes = review.notes;
    dto.reviewerId = review.reviewerId;
    dto.reviewerName = review.reviewerName;
    dto.reviewerEmail = review.reviewerEmail;
    dto.reviewedAt = review.reviewedAt.toISOString();
    return dto;
  }
}

export class PaginatedRecentReviewsDto {
  @ApiProperty({ type: [RecentReviewDto] }) items: RecentReviewDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;

  static fromDomain(paginated: PaginatedRecentReviews): PaginatedRecentReviewsDto {
    const dto = new PaginatedRecentReviewsDto();
    dto.items = paginated.items.map((r) => RecentReviewDto.fromDomain(r));
    dto.total = paginated.total;
    dto.page = paginated.page;
    dto.limit = paginated.limit;
    dto.totalPages = paginated.totalPages;
    return dto;
  }
}

export class ModeratorDashboardResponseDto {
  @ApiProperty({ type: ReviewStatsDto }) reviewStats: ReviewStatsDto;
  @ApiProperty({ type: QueueStatsDto }) queueStats: QueueStatsDto;
  @ApiProperty({ type: PaginatedRecentReviewsDto }) recentReviews: PaginatedRecentReviewsDto;

  static fromDomain(dashboard: ModeratorDashboard): ModeratorDashboardResponseDto {
    const dto = new ModeratorDashboardResponseDto();
    dto.reviewStats = ReviewStatsDto.fromDomain(dashboard.reviewStats);
    dto.queueStats = QueueStatsDto.fromDomain(dashboard.queueStats);
    dto.recentReviews = PaginatedRecentReviewsDto.fromDomain(dashboard.recentReviews);
    return dto;
  }
}
