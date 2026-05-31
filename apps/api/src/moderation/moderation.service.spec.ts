import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import {
  MODERATION_REPOSITORY,
  type IModerationRepository,
} from './interfaces/moderation-repository.interface';
import type {
  ModerationReview,
  ModerationReviewWithReviewer,
  PaginatedQueueResult,
  ReviewQueueItem,
} from './domain/moderation-review';

// ── Builders ─────────────────────────────────────────────────────────────────

function buildReview(overrides: Partial<ModerationReview> = {}): ModerationReview {
  return {
    id: 'review-uuid-1',
    listingId: 'listing-uuid-1',
    reviewerId: 'reviewer-uuid-1',
    decision: 'approved',
    notes: null,
    createdAt: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  };
}

function buildReviewWithReviewer(
  overrides: Partial<ModerationReviewWithReviewer> = {},
): ModerationReviewWithReviewer {
  return {
    ...buildReview(),
    reviewerName: 'Moderator One',
    reviewerEmail: 'mod@quicklister.co.uk',
    ...overrides,
  };
}

function buildQueueItem(overrides: Partial<ReviewQueueItem> = {}): ReviewQueueItem {
  return {
    id: 'listing-uuid-1',
    title: 'Nice 2-bed flat',
    listingType: 'residential_let',
    propertyType: 'flat',
    askingPrice: null,
    monthlyRent: 120000,
    city: 'London',
    postcode: 'E1 6RF',
    bedrooms: 2,
    submittedAt: new Date('2026-01-01T10:00:00Z'),
    primaryPhotoUrl: '/uploads/listing-media/photo.jpg',
    submitter: { id: 'user-uuid-1', fullName: 'Alice Smith', email: 'alice@example.com' },
    ...overrides,
  };
}

function buildPaginatedQueue(
  overrides: Partial<PaginatedQueueResult> = {},
): PaginatedQueueResult {
  return {
    items: [buildQueueItem()],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ModerationService', () => {
  let service: ModerationService;
  let repo: jest.Mocked<IModerationRepository>;

  const LISTING_ID = 'listing-uuid-1';
  const REVIEWER_ID = 'reviewer-uuid-1';

  beforeEach(() => {
    repo = {
      findQueue: jest.fn(),
      findListingStatus: jest.fn(),
      createReviewAndUpdateStatus: jest.fn(),
      findReviewsByListingId: jest.fn(),
    };

    const providers = new Map([[MODERATION_REPOSITORY, repo]]);
    service = new ModerationService(providers.get(MODERATION_REPOSITORY) as IModerationRepository);
  });

  // ── getQueue ─────────────────────────────────────────────────────────────

  describe('getQueue', () => {
    it('returns paginated queue from the repository', async () => {
      const expected = buildPaginatedQueue();
      repo.findQueue.mockResolvedValue(expected);

      const result = await service.getQueue(1, 20);

      expect(result).toEqual(expected);
    });

    it('applies default page=1 and limit=20 when not provided', async () => {
      repo.findQueue.mockResolvedValue(buildPaginatedQueue());

      await service.getQueue(undefined, undefined);

      expect(repo.findQueue).toHaveBeenCalledWith(1, 20);
    });

    it('returns empty queue when no listings are pending review', async () => {
      repo.findQueue.mockResolvedValue(buildPaginatedQueue({ items: [], total: 0, totalPages: 0 }));

      const result = await service.getQueue();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('re-throws InternalServerErrorException from the repository', async () => {
      repo.findQueue.mockRejectedValue(new InternalServerErrorException());

      await expect(service.getQueue()).rejects.toThrow(InternalServerErrorException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findQueue.mockRejectedValue(new Error('unexpected'));

      await expect(service.getQueue()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── approve ───────────────────────────────────────────────────────────────

  describe('approve', () => {
    it('creates an approved review and transitions listing to published', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      const expected = buildReview({ decision: 'approved' });
      repo.createReviewAndUpdateStatus.mockResolvedValue(expected);

      const result = await service.approve(LISTING_ID, REVIEWER_ID, {});

      expect(repo.createReviewAndUpdateStatus).toHaveBeenCalledWith(
        { listingId: LISTING_ID, reviewerId: REVIEWER_ID, decision: 'approved', notes: null },
        'published',
      );
      expect(result.decision).toBe('approved');
    });

    it('stores optional notes on approval', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      repo.createReviewAndUpdateStatus.mockResolvedValue(
        buildReview({ notes: 'Excellent listing' }),
      );

      await service.approve(LISTING_ID, REVIEWER_ID, { notes: 'Excellent listing' });

      expect(repo.createReviewAndUpdateStatus).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Excellent listing' }),
        'published',
      );
    });

    it('throws NotFoundException when the listing does not exist', async () => {
      repo.findListingStatus.mockResolvedValue(null);

      await expect(service.approve(LISTING_ID, REVIEWER_ID, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.createReviewAndUpdateStatus).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when listing is not in pending_review', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'draft' });

      await expect(service.approve(LISTING_ID, REVIEWER_ID, {})).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.createReviewAndUpdateStatus).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when listing is already published', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'published' });

      await expect(service.approve(LISTING_ID, REVIEWER_ID, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('re-throws BadRequestException from the repository (concurrent review race)', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      repo.createReviewAndUpdateStatus.mockRejectedValue(
        new BadRequestException('Listing is no longer available for review'),
      );

      await expect(service.approve(LISTING_ID, REVIEWER_ID, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('wraps unexpected repository errors in InternalServerErrorException', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      repo.createReviewAndUpdateStatus.mockRejectedValue(new Error('DB crashed'));

      await expect(service.approve(LISTING_ID, REVIEWER_ID, {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── reject ────────────────────────────────────────────────────────────────

  describe('reject', () => {
    it('creates a rejected review and transitions listing back to draft', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      const expected = buildReview({ decision: 'rejected', notes: 'Missing floor plan' });
      repo.createReviewAndUpdateStatus.mockResolvedValue(expected);

      const result = await service.reject(LISTING_ID, REVIEWER_ID, {
        notes: 'Missing floor plan',
      });

      expect(repo.createReviewAndUpdateStatus).toHaveBeenCalledWith(
        {
          listingId: LISTING_ID,
          reviewerId: REVIEWER_ID,
          decision: 'rejected',
          notes: 'Missing floor plan',
        },
        'draft',
      );
      expect(result.decision).toBe('rejected');
      expect(result.notes).toBe('Missing floor plan');
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findListingStatus.mockResolvedValue(null);

      await expect(
        service.reject(LISTING_ID, REVIEWER_ID, { notes: 'Photos are blurry' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when listing status is not pending_review', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'archived' });

      await expect(
        service.reject(LISTING_ID, REVIEWER_ID, { notes: 'Not applicable' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('re-throws BadRequestException from the repository (concurrent review race)', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      repo.createReviewAndUpdateStatus.mockRejectedValue(
        new BadRequestException('Listing is no longer available for review'),
      );

      await expect(
        service.reject(LISTING_ID, REVIEWER_ID, { notes: 'Reason here' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingStatus.mockResolvedValue({ status: 'pending_review' });
      repo.createReviewAndUpdateStatus.mockRejectedValue(new Error('timeout'));

      await expect(
        service.reject(LISTING_ID, REVIEWER_ID, { notes: 'Bad photos' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── getReviewHistory ───────────────────────────────────────────────────────

  describe('getReviewHistory', () => {
    it('returns all reviews for a listing in descending order', async () => {
      const reviews = [
        buildReviewWithReviewer({ decision: 'approved', createdAt: new Date('2026-01-02') }),
        buildReviewWithReviewer({ decision: 'rejected', createdAt: new Date('2026-01-01') }),
      ];
      repo.findReviewsByListingId.mockResolvedValue(reviews);

      const result = await service.getReviewHistory(LISTING_ID);

      expect(result).toHaveLength(2);
      expect(result[0]?.decision).toBe('approved');
      expect(result[1]?.decision).toBe('rejected');
    });

    it('returns empty array for a listing with no review history', async () => {
      repo.findReviewsByListingId.mockResolvedValue([]);

      const result = await service.getReviewHistory(LISTING_ID);

      expect(result).toHaveLength(0);
    });

    it('includes reviewer identity in each record', async () => {
      repo.findReviewsByListingId.mockResolvedValue([
        buildReviewWithReviewer({ reviewerName: 'Jane Mod', reviewerEmail: 'jane@quicklister.co.uk' }),
      ]);

      const result = await service.getReviewHistory(LISTING_ID);

      expect(result[0]?.reviewerName).toBe('Jane Mod');
      expect(result[0]?.reviewerEmail).toBe('jane@quicklister.co.uk');
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findReviewsByListingId.mockRejectedValue(new Error('timeout'));

      await expect(service.getReviewHistory(LISTING_ID)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
