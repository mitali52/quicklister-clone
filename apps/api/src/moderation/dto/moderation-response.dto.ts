import type { ListingType, PropertyType } from '../../listings/domain/listing';
import type {
  ModerationReview,
  ModerationReviewWithReviewer,
  PaginatedQueueResult,
  ReviewDecision,
  ReviewQueueItem,
} from '../domain/moderation-review';

export class ModerationReviewDto {
  id!: string;
  listingId!: string;
  reviewerId!: string;
  decision!: ReviewDecision;
  notes!: string | null;
  createdAt!: string;

  static fromDomain(review: ModerationReview): ModerationReviewDto {
    const dto = new ModerationReviewDto();
    dto.id = review.id;
    dto.listingId = review.listingId;
    dto.reviewerId = review.reviewerId;
    dto.decision = review.decision;
    dto.notes = review.notes;
    dto.createdAt = review.createdAt.toISOString();
    return dto;
  }
}

export class ModerationReviewWithReviewerDto extends ModerationReviewDto {
  reviewerName!: string;
  reviewerEmail!: string;

  static fromDomain(review: ModerationReviewWithReviewer): ModerationReviewWithReviewerDto {
    const dto = new ModerationReviewWithReviewerDto();
    dto.id = review.id;
    dto.listingId = review.listingId;
    dto.reviewerId = review.reviewerId;
    dto.decision = review.decision;
    dto.notes = review.notes;
    dto.createdAt = review.createdAt.toISOString();
    dto.reviewerName = review.reviewerName;
    dto.reviewerEmail = review.reviewerEmail;
    return dto;
  }
}

export class ReviewQueueSubmitterDto {
  id!: string;
  fullName!: string;
  email!: string;
}

export class ReviewQueueItemDto {
  id!: string;
  title!: string;
  listingType!: ListingType;
  propertyType!: PropertyType;
  askingPrice!: number | null;
  monthlyRent!: number | null;
  city!: string;
  postcode!: string;
  bedrooms!: number | null;
  submittedAt!: string;
  primaryPhotoUrl!: string | null;
  submitter!: ReviewQueueSubmitterDto;

  static fromDomain(item: ReviewQueueItem): ReviewQueueItemDto {
    const dto = new ReviewQueueItemDto();
    dto.id = item.id;
    dto.title = item.title;
    dto.listingType = item.listingType;
    dto.propertyType = item.propertyType;
    dto.askingPrice = item.askingPrice;
    dto.monthlyRent = item.monthlyRent;
    dto.city = item.city;
    dto.postcode = item.postcode;
    dto.bedrooms = item.bedrooms;
    dto.submittedAt = item.submittedAt.toISOString();
    dto.primaryPhotoUrl = item.primaryPhotoUrl;
    dto.submitter = {
      id: item.submitter.id,
      fullName: item.submitter.fullName,
      email: item.submitter.email,
    };
    return dto;
  }
}

export class ReviewQueueMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class ReviewQueueResponseDto {
  data!: ReviewQueueItemDto[];
  meta!: ReviewQueueMetaDto;

  static fromDomain(result: PaginatedQueueResult): ReviewQueueResponseDto {
    const dto = new ReviewQueueResponseDto();
    dto.data = result.items.map((item) => ReviewQueueItemDto.fromDomain(item));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
