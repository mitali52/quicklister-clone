import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import {
  LISTINGS_REPOSITORY,
  type IListingsRepository,
} from './interfaces/listings-repository.interface';
import type { Listing } from './domain/listing';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 'listing-uuid-1',
    userId: 'user-uuid-1',
    title: 'Bright 2-bed flat in Islington',
    description: 'Lovely period flat with original features.',
    listingType: 'residential_let',
    propertyType: 'flat',
    status: 'draft',
    askingPrice: null,
    monthlyRent: 200000,
    addressLine1: '12 Baker Street',
    addressLine2: null,
    city: 'London',
    postcode: 'NW1 6XE',
    bedrooms: 2,
    bathrooms: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

function buildPaginatedResult<T>(data: T[]) {
  return { data, total: data.length, page: 1, limit: 20 };
}

function buildCreateDto() {
  return {
    title: 'Bright 2-bed flat in Islington',
    listingType: 'residential_let' as const,
    propertyType: 'flat' as const,
    monthlyRent: 200000,
    addressLine1: '12 Baker Street',
    city: 'London',
    postcode: 'NW1 6XE',
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ListingsService', () => {
  let service: ListingsService;
  let repo: jest.Mocked<IListingsRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };

    const providers = new Map([[LISTINGS_REPOSITORY, repo]]);
    service = new ListingsService(providers.get(LISTINGS_REPOSITORY) as IListingsRepository);
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated listings for admin', async () => {
      repo.findAll.mockResolvedValue(buildPaginatedResult([buildListing()]));

      const result = await service.findAll('admin', { page: 1, limit: 20 });

      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });

    it('returns paginated listings for moderator', async () => {
      repo.findAll.mockResolvedValue(buildPaginatedResult([buildListing()]));

      const result = await service.findAll('moderator', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
    });

    it('throws ForbiddenException when called by a regular user', async () => {
      await expect(service.findAll('user', { page: 1, limit: 20 })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db down'));

      await expect(service.findAll('admin', { page: 1, limit: 20 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── findMyListings ─────────────────────────────────────────────────────────

  describe('findMyListings', () => {
    it('returns listings owned by the user', async () => {
      repo.findByUserId.mockResolvedValue(buildPaginatedResult([buildListing()]));

      const result = await service.findMyListings('user-uuid-1', { page: 1, limit: 20 });

      expect(repo.findByUserId).toHaveBeenCalledWith('user-uuid-1', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findByUserId.mockRejectedValue(new Error('db error'));

      await expect(service.findMyListings('user-uuid-1', { page: 1, limit: 20 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── findPendingReview ──────────────────────────────────────────────────────

  describe('findPendingReview', () => {
    it('returns pending_review listings for moderator', async () => {
      repo.findByStatus.mockResolvedValue(buildPaginatedResult([buildListing({ status: 'pending_review' })]));

      const result = await service.findPendingReview('moderator', { page: 1, limit: 20 });

      expect(repo.findByStatus).toHaveBeenCalledWith('pending_review', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });

    it('throws ForbiddenException when called by a regular user', async () => {
      await expect(service.findPendingReview('user', { page: 1, limit: 20 })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the listing when owner requests it', async () => {
      const listing = buildListing({ userId: 'user-uuid-1' });
      repo.findById.mockResolvedValue(listing);

      const result = await service.findById('listing-uuid-1', 'user-uuid-1', 'user');

      expect(result).toEqual(listing);
    });

    it('returns the listing when admin requests any listing', async () => {
      const listing = buildListing({ userId: 'other-user' });
      repo.findById.mockResolvedValue(listing);

      const result = await service.findById('listing-uuid-1', 'admin-uuid', 'admin');

      expect(result).toEqual(listing);
    });

    it('throws ForbiddenException when a user requests another user\'s listing', async () => {
      const listing = buildListing({ userId: 'owner-uuid' });
      repo.findById.mockResolvedValue(listing);

      await expect(service.findById('listing-uuid-1', 'other-uuid', 'user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('missing', 'user-uuid-1', 'user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── createDraft ───────────────────────────────────────────────────────────

  describe('createDraft', () => {
    it('creates and returns a draft listing', async () => {
      const listing = buildListing({ status: 'draft' });
      repo.create.mockResolvedValue(listing);

      const result = await service.createDraft('user-uuid-1', buildCreateDto());

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-uuid-1', listingType: 'residential_let' }),
      );
      expect(result.status).toBe('draft');
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.create.mockRejectedValue(new Error('db error'));

      await expect(service.createDraft('user-uuid-1', buildCreateDto())).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── updateDraft ───────────────────────────────────────────────────────────

  describe('updateDraft', () => {
    it('updates a draft listing when owner requests', async () => {
      const listing = buildListing({ status: 'draft' });
      const updated = buildListing({ title: 'Updated Title' });
      repo.findById.mockResolvedValue(listing);
      repo.update.mockResolvedValue(updated);

      const result = await service.updateDraft('listing-uuid-1', 'user-uuid-1', { title: 'Updated Title' });

      expect(repo.update).toHaveBeenCalledWith(
        'listing-uuid-1',
        expect.objectContaining({ title: 'Updated Title' }),
      );
      expect(result.title).toBe('Updated Title');
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'owner-uuid' }));

      await expect(
        service.updateDraft('listing-uuid-1', 'other-uuid', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when listing is not in draft status', async () => {
      repo.findById.mockResolvedValue(buildListing({ status: 'pending_review' }));

      await expect(
        service.updateDraft('listing-uuid-1', 'user-uuid-1', { title: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateDraft('missing', 'user-uuid-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── submitForReview ───────────────────────────────────────────────────────

  describe('submitForReview', () => {
    it('transitions listing from draft to pending_review', async () => {
      const listing = buildListing({ status: 'draft' });
      const submitted = buildListing({ status: 'pending_review' });
      repo.findById.mockResolvedValue(listing);
      repo.updateStatus.mockResolvedValue(submitted);

      const result = await service.submitForReview('listing-uuid-1', 'user-uuid-1');

      expect(repo.updateStatus).toHaveBeenCalledWith('listing-uuid-1', 'pending_review');
      expect(result.status).toBe('pending_review');
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'owner-uuid' }));

      await expect(service.submitForReview('listing-uuid-1', 'other-uuid')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when listing is not a draft', async () => {
      repo.findById.mockResolvedValue(buildListing({ status: 'published' }));

      await expect(
        service.submitForReview('listing-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.submitForReview('missing', 'user-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── publish ───────────────────────────────────────────────────────────────

  describe('publish', () => {
    it('transitions listing from pending_review to published by moderator', async () => {
      const listing = buildListing({ status: 'pending_review' });
      const published = buildListing({ status: 'published' });
      repo.findById.mockResolvedValue(listing);
      repo.updateStatus.mockResolvedValue(published);

      const result = await service.publish('listing-uuid-1', 'moderator');

      expect(repo.updateStatus).toHaveBeenCalledWith('listing-uuid-1', 'published');
      expect(result.status).toBe('published');
    });

    it('throws ForbiddenException when called by a regular user', async () => {
      await expect(service.publish('listing-uuid-1', 'user')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when listing is not in pending_review status', async () => {
      repo.findById.mockResolvedValue(buildListing({ status: 'draft' }));

      await expect(service.publish('listing-uuid-1', 'moderator')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.publish('missing', 'admin')).rejects.toThrow(NotFoundException);
    });
  });

  // ── archive ───────────────────────────────────────────────────────────────

  describe('archive', () => {
    it('archives a published listing when owner requests', async () => {
      const listing = buildListing({ status: 'published', userId: 'user-uuid-1' });
      const archived = buildListing({ status: 'archived' });
      repo.findById.mockResolvedValue(listing);
      repo.updateStatus.mockResolvedValue(archived);

      const result = await service.archive('listing-uuid-1', 'user-uuid-1', 'user');

      expect(repo.updateStatus).toHaveBeenCalledWith('listing-uuid-1', 'archived');
      expect(result.status).toBe('archived');
    });

    it('archives any listing when admin requests', async () => {
      const listing = buildListing({ status: 'published', userId: 'other-user' });
      const archived = buildListing({ status: 'archived' });
      repo.findById.mockResolvedValue(listing);
      repo.updateStatus.mockResolvedValue(archived);

      const result = await service.archive('listing-uuid-1', 'admin-uuid', 'admin');

      expect(result.status).toBe('archived');
    });

    it('throws ForbiddenException when a user tries to archive another user\'s listing', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'owner-uuid' }));

      await expect(service.archive('listing-uuid-1', 'other-uuid', 'user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when listing is already archived', async () => {
      repo.findById.mockResolvedValue(buildListing({ status: 'archived', userId: 'user-uuid-1' }));

      await expect(service.archive('listing-uuid-1', 'user-uuid-1', 'user')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.archive('missing', 'user-uuid-1', 'user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes listing when owner requests', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'user-uuid-1' }));
      repo.softDelete.mockResolvedValue(undefined);

      await service.remove('listing-uuid-1', 'user-uuid-1', 'user');

      expect(repo.softDelete).toHaveBeenCalledWith('listing-uuid-1');
    });

    it('soft-deletes any listing when admin requests', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'other-user' }));
      repo.softDelete.mockResolvedValue(undefined);

      await service.remove('listing-uuid-1', 'admin-uuid', 'admin');

      expect(repo.softDelete).toHaveBeenCalledWith('listing-uuid-1');
    });

    it('throws ForbiddenException when a user tries to delete another user\'s listing', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'owner-uuid' }));

      await expect(service.remove('listing-uuid-1', 'other-uuid', 'user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-uuid-1', 'user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildListing({ userId: 'user-uuid-1' }));
      repo.softDelete.mockRejectedValue(new Error('db error'));

      await expect(service.remove('listing-uuid-1', 'user-uuid-1', 'user')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
