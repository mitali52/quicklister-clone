import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListingMediaService } from './listing-media.service';
import {
  LISTING_MEDIA_REPOSITORY,
  type IListingMediaRepository,
} from './interfaces/listing-media-repository.interface';
import { StorageService } from '../storage/storage.service';
import type { ListingMedia } from './domain/listing-media';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildMedia(overrides: Partial<ListingMedia> = {}): ListingMedia {
  return {
    id: 'media-uuid-1',
    listingId: 'listing-uuid-1',
    url: '/uploads/listing-media/abc.jpg',
    filename: 'abc.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 500_000,
    sortOrder: 0,
    isPrimary: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildMulterFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 500_000,
    buffer: Buffer.from('fake-image-data'),
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ListingMediaService', () => {
  let service: ListingMediaService;
  let repo: jest.Mocked<IListingMediaRepository>;
  let storageService: jest.Mocked<StorageService>;

  const LISTING_ID = 'listing-uuid-1';
  const REQUESTER_ID = 'user-uuid-1';
  const OTHER_USER_ID = 'user-uuid-other';

  beforeEach(() => {
    repo = {
      findByListingId: jest.fn(),
      findById: jest.fn(),
      findListingOwner: jest.fn(),
      countByListingId: jest.fn(),
      create: jest.fn(),
      reorder: jest.fn(),
      delete: jest.fn(),
    };

    storageService = {
      validateImage: jest.fn(),
      upload: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;

    const providers = new Map([
      [LISTING_MEDIA_REPOSITORY, repo],
    ]);
    service = new ListingMediaService(
      providers.get(LISTING_MEDIA_REPOSITORY) as IListingMediaRepository,
      storageService,
    );
  });

  // ── findByListingId ────────────────────────────────────────────────────────

  describe('findByListingId', () => {
    it('returns media list for the listing owner', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findByListingId.mockResolvedValue([buildMedia()]);

      const result = await service.findByListingId(LISTING_ID, REQUESTER_ID);

      expect(result).toHaveLength(1);
      expect(repo.findByListingId).toHaveBeenCalledWith(LISTING_ID);
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findListingOwner.mockResolvedValue(null);

      await expect(service.findByListingId(LISTING_ID, REQUESTER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      repo.findListingOwner.mockResolvedValue(OTHER_USER_ID);

      await expect(service.findByListingId(LISTING_ID, REQUESTER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingOwner.mockRejectedValue(new Error('db down'));

      await expect(service.findByListingId(LISTING_ID, REQUESTER_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── upload ─────────────────────────────────────────────────────────────────

  describe('upload', () => {
    it('uploads file and returns created media', async () => {
      const media = buildMedia();
      const file = buildMulterFile();
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.countByListingId.mockResolvedValue(0);
      storageService.upload.mockResolvedValue({ url: '/uploads/listing-media/abc.jpg', filename: 'abc.jpg' });
      repo.create.mockResolvedValue(media);

      const result = await service.upload(LISTING_ID, REQUESTER_ID, file);

      expect(storageService.validateImage).toHaveBeenCalledWith(file);
      expect(storageService.upload).toHaveBeenCalledWith(file);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          listingId: LISTING_ID,
          isPrimary: true,
          sortOrder: 0,
        }),
      );
      expect(result).toEqual(media);
    });

    it('sets isPrimary false when other media already exist', async () => {
      const file = buildMulterFile();
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.countByListingId.mockResolvedValue(3);
      storageService.upload.mockResolvedValue({ url: '/uploads/listing-media/xyz.jpg', filename: 'xyz.jpg' });
      repo.create.mockResolvedValue(buildMedia({ isPrimary: false, sortOrder: 3 }));

      await service.upload(LISTING_ID, REQUESTER_ID, file);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isPrimary: false, sortOrder: 3 }),
      );
    });

    it('throws ForbiddenException when requester does not own the listing', async () => {
      repo.findListingOwner.mockResolvedValue(OTHER_USER_ID);

      await expect(
        service.upload(LISTING_ID, REQUESTER_ID, buildMulterFile()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException on invalid file type (propagated from StorageService)', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.countByListingId.mockResolvedValue(0);
      storageService.validateImage.mockImplementation(() => {
        throw new BadRequestException('Unsupported file type');
      });

      await expect(
        service.upload(LISTING_ID, REQUESTER_ID, buildMulterFile({ mimetype: 'image/gif' })),
      ).rejects.toThrow(BadRequestException);

      expect(storageService.upload).not.toHaveBeenCalled();
    });

    it('throws UnprocessableEntityException when image limit is reached', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.countByListingId.mockResolvedValue(20);

      await expect(
        service.upload(LISTING_ID, REQUESTER_ID, buildMulterFile()),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(storageService.upload).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when listing does not exist', async () => {
      repo.findListingOwner.mockResolvedValue(null);

      await expect(
        service.upload(LISTING_ID, REQUESTER_ID, buildMulterFile()),
      ).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.countByListingId.mockResolvedValue(0);
      storageService.upload.mockRejectedValue(new Error('disk full'));

      await expect(
        service.upload(LISTING_ID, REQUESTER_ID, buildMulterFile()),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── reorder ────────────────────────────────────────────────────────────────

  describe('reorder', () => {
    it('reorders media and returns updated list', async () => {
      const existing = [
        buildMedia({ id: 'media-1', sortOrder: 0 }),
        buildMedia({ id: 'media-2', sortOrder: 1, isPrimary: false }),
      ];
      const reordered = [
        buildMedia({ id: 'media-2', sortOrder: 0, isPrimary: true }),
        buildMedia({ id: 'media-1', sortOrder: 1, isPrimary: false }),
      ];
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findByListingId.mockResolvedValue(existing);
      repo.reorder.mockResolvedValue(reordered);

      const result = await service.reorder(LISTING_ID, REQUESTER_ID, {
        items: [
          { id: 'media-2', sortOrder: 0 },
          { id: 'media-1', sortOrder: 1 },
        ],
      });

      expect(repo.reorder).toHaveBeenCalledWith(LISTING_ID, [
        { id: 'media-2', sortOrder: 0 },
        { id: 'media-1', sortOrder: 1 },
      ]);
      expect(result).toEqual(reordered);
    });

    it('throws BadRequestException when an item ID does not belong to the listing', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findByListingId.mockResolvedValue([buildMedia({ id: 'media-1' })]);

      await expect(
        service.reorder(LISTING_ID, REQUESTER_ID, {
          items: [{ id: 'ghost-media-id', sortOrder: 0 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.reorder).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when requester does not own the listing', async () => {
      repo.findListingOwner.mockResolvedValue(OTHER_USER_ID);

      await expect(
        service.reorder(LISTING_ID, REQUESTER_ID, { items: [{ id: 'media-1', sortOrder: 0 }] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findByListingId.mockResolvedValue([buildMedia({ id: 'media-1' })]);
      repo.reorder.mockRejectedValue(new Error('db error'));

      await expect(
        service.reorder(LISTING_ID, REQUESTER_ID, { items: [{ id: 'media-1', sortOrder: 0 }] }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes media and removes the file from storage', async () => {
      const media = buildMedia({ id: 'media-uuid-1', listingId: LISTING_ID });
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findById.mockResolvedValue(media);
      repo.delete.mockResolvedValue(media);

      await service.delete(LISTING_ID, 'media-uuid-1', REQUESTER_ID);

      expect(repo.delete).toHaveBeenCalledWith('media-uuid-1');
      expect(storageService.delete).toHaveBeenCalledWith(media.filename);
    });

    it('throws NotFoundException when media does not exist', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findById.mockResolvedValue(null);

      await expect(
        service.delete(LISTING_ID, 'missing-media', REQUESTER_ID),
      ).rejects.toThrow(NotFoundException);

      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when media belongs to a different listing', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findById.mockResolvedValue(buildMedia({ listingId: 'other-listing-id' }));

      await expect(
        service.delete(LISTING_ID, 'media-uuid-1', REQUESTER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when requester does not own the listing', async () => {
      repo.findListingOwner.mockResolvedValue(OTHER_USER_ID);

      await expect(
        service.delete(LISTING_ID, 'media-uuid-1', REQUESTER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findListingOwner.mockResolvedValue(REQUESTER_ID);
      repo.findById.mockResolvedValue(buildMedia({ id: 'media-uuid-1', listingId: LISTING_ID }));
      repo.delete.mockRejectedValue(new Error('db error'));

      await expect(
        service.delete(LISTING_ID, 'media-uuid-1', REQUESTER_ID),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
