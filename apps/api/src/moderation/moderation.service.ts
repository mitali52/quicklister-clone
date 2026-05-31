import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  ModerationReview,
  ModerationReviewWithReviewer,
  PaginatedQueueResult,
} from './domain/moderation-review';
import type { IModerationRepository } from './interfaces/moderation-repository.interface';
import { MODERATION_REPOSITORY } from './interfaces/moderation-repository.interface';
import type { ApproveListingDto } from './dto/approve-listing.dto';
import type { RejectListingDto } from './dto/reject-listing.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class ModerationService {
  constructor(
    @Inject(MODERATION_REPOSITORY)
    private readonly repo: IModerationRepository,
  ) {}

  async getQueue(page?: number, limit?: number): Promise<PaginatedQueueResult> {
    try {
      return await this.repo.findQueue(page ?? DEFAULT_PAGE, limit ?? DEFAULT_LIMIT);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve review queue');
    }
  }

  async approve(
    listingId: string,
    reviewerId: string,
    dto: ApproveListingDto,
  ): Promise<ModerationReview> {
    await this.assertListingPendingReview(listingId);

    try {
      return await this.repo.createReviewAndUpdateStatus(
        {
          listingId,
          reviewerId,
          decision: 'approved',
          notes: dto.notes ?? null,
        },
        'published',
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to approve listing');
    }
  }

  async reject(
    listingId: string,
    reviewerId: string,
    dto: RejectListingDto,
  ): Promise<ModerationReview> {
    await this.assertListingPendingReview(listingId);

    try {
      return await this.repo.createReviewAndUpdateStatus(
        {
          listingId,
          reviewerId,
          decision: 'rejected',
          notes: dto.notes,
        },
        'draft',
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to reject listing');
    }
  }

  async getReviewHistory(listingId: string): Promise<ModerationReviewWithReviewer[]> {
    try {
      return await this.repo.findReviewsByListingId(listingId);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to retrieve review history');
    }
  }

  private async assertListingPendingReview(listingId: string): Promise<void> {
    let listing: { status: string } | null;

    try {
      listing = await this.repo.findListingStatus(listingId);
    } catch {
      throw new InternalServerErrorException('Failed to retrieve listing');
    }

    if (listing === null) {
      throw new NotFoundException(`Listing ${listingId} not found`);
    }

    if (listing.status !== 'pending_review') {
      throw new BadRequestException(
        `Listing cannot be reviewed — current status is '${listing.status}', expected 'pending_review'`,
      );
    }
  }
}
