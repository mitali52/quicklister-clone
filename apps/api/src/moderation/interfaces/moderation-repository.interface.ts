import type { ListingStatus } from '../../listings/domain/listing';
import type {
  CreateReviewData,
  ModerationReview,
  ModerationReviewWithReviewer,
  PaginatedQueueResult,
} from '../domain/moderation-review';

export interface IModerationRepository {
  findQueue(page: number, limit: number): Promise<PaginatedQueueResult>;
  findListingStatus(listingId: string): Promise<{ status: ListingStatus } | null>;
  createReviewAndUpdateStatus(
    data: CreateReviewData,
    newStatus: ListingStatus,
  ): Promise<ModerationReview>;
  findReviewsByListingId(listingId: string): Promise<ModerationReviewWithReviewer[]>;
}

export const MODERATION_REPOSITORY = Symbol('MODERATION_REPOSITORY');
