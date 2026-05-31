import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  LISTING_MEDIA_REPOSITORY,
  type IListingMediaRepository,
} from './interfaces/listing-media-repository.interface';
import type { ListingMedia, ReorderItem } from './domain/listing-media';
import { StorageService } from '../storage/storage.service';
import type { ReorderListingMediaDto } from './dto/reorder-listing-media.dto';

const MAX_IMAGES_PER_LISTING = 20;

@Injectable()
export class ListingMediaService {
  constructor(
    @Inject(LISTING_MEDIA_REPOSITORY)
    private readonly repo: IListingMediaRepository,
    private readonly storageService: StorageService,
  ) {}

  // ── List media for a listing ──────────────────────────────────────────────

  async findByListingId(
    listingId: string,
    requesterId: string,
  ): Promise<ListingMedia[]> {
    try {
      await this.assertListingAccess(listingId, requesterId);
      return await this.repo.findByListingId(listingId);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listing media');
    }
  }

  // ── Upload a new image ────────────────────────────────────────────────────

  async upload(
    listingId: string,
    requesterId: string,
    file: Express.Multer.File,
  ): Promise<ListingMedia> {
    try {
      await this.assertOwnership(listingId, requesterId);

      // Validate file type + size (throws BadRequestException on failure)
      this.storageService.validateImage(file);

      const count = await this.repo.countByListingId(listingId);
      if (count >= MAX_IMAGES_PER_LISTING) {
        throw new UnprocessableEntityException(
          `A listing may have at most ${MAX_IMAGES_PER_LISTING} images.`,
        );
      }

      const { url, filename } = await this.storageService.upload(file);

      return await this.repo.create({
        listingId,
        url,
        filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        sortOrder: count,
        isPrimary: count === 0,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      if (err instanceof UnprocessableEntityException) throw err;
      throw new InternalServerErrorException('Failed to upload media');
    }
  }

  // ── Reorder images ────────────────────────────────────────────────────────

  async reorder(
    listingId: string,
    requesterId: string,
    dto: ReorderListingMediaDto,
  ): Promise<ListingMedia[]> {
    try {
      await this.assertOwnership(listingId, requesterId);

      // Verify all IDs belong to this listing
      const existing = await this.repo.findByListingId(listingId);
      const existingIds = new Set(existing.map((m) => m.id));
      const allBelong = dto.items.every((item) => existingIds.has(item.id));
      if (!allBelong) {
        throw new BadRequestException(
          'One or more media IDs do not belong to this listing.',
        );
      }

      const items: ReorderItem[] = dto.items.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
      }));
      return await this.repo.reorder(listingId, items);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to reorder media');
    }
  }

  // ── Delete an image ───────────────────────────────────────────────────────

  async delete(
    listingId: string,
    mediaId: string,
    requesterId: string,
  ): Promise<void> {
    try {
      await this.assertOwnership(listingId, requesterId);

      const media = await this.repo.findById(mediaId);
      if (!media) throw new NotFoundException(`Media ${mediaId} not found`);
      if (media.listingId !== listingId) {
        throw new BadRequestException('Media does not belong to this listing');
      }

      const deleted = await this.repo.delete(mediaId);
      await this.storageService.delete(deleted.filename);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to delete media');
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async assertOwnership(listingId: string, requesterId: string): Promise<void> {
    const ownerId = await this.repo.findListingOwner(listingId);
    if (!ownerId) throw new NotFoundException(`Listing ${listingId} not found`);
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }

  private async assertListingAccess(listingId: string, requesterId: string): Promise<void> {
    const ownerId = await this.repo.findListingOwner(listingId);
    if (!ownerId) throw new NotFoundException(`Listing ${listingId} not found`);
    // For now only the owner can list media; expand this when published listings are public
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this listing');
    }
  }
}
