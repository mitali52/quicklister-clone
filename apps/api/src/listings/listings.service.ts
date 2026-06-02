import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  LISTINGS_REPOSITORY,
  type IListingsRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/listings-repository.interface';
import type { Listing, ListingStatus } from './domain/listing';
import type { CreateListingDto } from './dto/create-listing.dto';
import type { UpdateListingDto } from './dto/update-listing.dto';

const MODERATOR_ROLES = ['moderator', 'admin'] as const;
type ModeratorRole = (typeof MODERATOR_ROLES)[number];

function isModeratorOrAdmin(role: string): role is ModeratorRole {
  return (MODERATOR_ROLES as readonly string[]).includes(role);
}

@Injectable()
export class ListingsService {
  constructor(
    @Inject(LISTINGS_REPOSITORY)
    private readonly repo: IListingsRepository,
  ) {}

  // ── Admin: unrestricted list ───────────────────────────────────────────────

  async findAll(requesterRole: string, opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    if (!isModeratorOrAdmin(requesterRole)) {
      throw new ForbiddenException('Only moderators and admins can list all listings');
    }
    try {
      return await this.repo.findAll(opts);
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listings');
    }
  }

  // ── User: own listings ────────────────────────────────────────────────────

  async findMyListings(userId: string, opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    try {
      return await this.repo.findByUserId(userId, opts);
    } catch (err) {
      throw new InternalServerErrorException('Failed to retrieve listings');
    }
  }

  // ── Moderator: pending review queue ───────────────────────────────────────

  async findPendingReview(requesterRole: string, opts: PaginationOpts): Promise<PaginatedResult<Listing>> {
    if (!isModeratorOrAdmin(requesterRole)) {
      throw new ForbiddenException('Only moderators and admins can access the review queue');
    }
    try {
      return await this.repo.findByStatus('pending_review', opts);
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listings');
    }
  }

  // ── Single listing ────────────────────────────────────────────────────────

  async findById(
    id: string,
    requesterId?: string,
    requesterRole?: string,
  ): Promise<Listing> {
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      // Anonymous users can only see published listings.
      if (!requesterRole || !requesterId) {
        if (listing.status !== 'published') {
          throw new ForbiddenException('You do not have access to this listing');
        }
        return listing;
      }

      // Moderators/admins can view any listing; users can only view their own
      if (!isModeratorOrAdmin(requesterRole) && listing.userId !== requesterId) {
        throw new ForbiddenException('You do not have access to this listing');
      }

      return listing;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to retrieve listing');
    }
  }

  // ── Create draft ──────────────────────────────────────────────────────────

  async createDraft(userId: string, dto: CreateListingDto): Promise<Listing> {
    try {
      return await this.repo.create({
        userId,
        title: dto.title,
        description: dto.description,
        listingType: dto.listingType,
        propertyType: dto.propertyType,
        askingPrice: dto.askingPrice,
        monthlyRent: dto.monthlyRent,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        postcode: dto.postcode,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to create listing');
    }
  }

  // ── Update draft ──────────────────────────────────────────────────────────

  async updateDraft(id: string, requesterId: string, dto: UpdateListingDto): Promise<Listing> {
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      this.assertOwnership(listing, requesterId);

      if (listing.status !== 'draft') {
        throw new BadRequestException('Only draft listings can be edited');
      }

      return await this.repo.update(id, {
        title: dto.title,
        description: dto.description,
        listingType: dto.listingType,
        propertyType: dto.propertyType,
        askingPrice: dto.askingPrice,
        monthlyRent: dto.monthlyRent,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        postcode: dto.postcode,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to update listing');
    }
  }

  // ── Submit for review ─────────────────────────────────────────────────────

  async submitForReview(id: string, requesterId: string): Promise<Listing> {
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      this.assertOwnership(listing, requesterId);

      if (listing.status !== 'draft') {
        throw new BadRequestException(`Listing must be in draft status to submit for review (current: ${listing.status})`);
      }

      return await this.repo.updateStatus(id, 'pending_review');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to submit listing for review');
    }
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async publish(id: string, requesterRole: string): Promise<Listing> {
    if (!isModeratorOrAdmin(requesterRole)) {
      throw new ForbiddenException('Only moderators and admins can publish listings');
    }
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      if (listing.status !== 'pending_review') {
        throw new BadRequestException(`Listing must be in pending_review status to publish (current: ${listing.status})`);
      }

      return await this.repo.updateStatus(id, 'published');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to publish listing');
    }
  }

  // ── Archive ───────────────────────────────────────────────────────────────

  async archive(id: string, requesterId: string, requesterRole: string): Promise<Listing> {
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      // Owner can archive their own; admin can archive any
      if (!isModeratorOrAdmin(requesterRole)) {
        this.assertOwnership(listing, requesterId);
      }

      if (listing.status === 'archived') {
        throw new BadRequestException('Listing is already archived');
      }

      return await this.repo.updateStatus(id, 'archived');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to archive listing');
    }
  }

  // ── Delete (soft) ─────────────────────────────────────────────────────────

  async remove(id: string, requesterId: string, requesterRole: string): Promise<void> {
    try {
      const listing = await this.repo.findById(id);
      if (!listing) throw new NotFoundException(`Listing ${id} not found`);

      // Admin can delete any listing; users can only delete their own
      if (!isModeratorOrAdmin(requesterRole)) {
        this.assertOwnership(listing, requesterId);
      }

      await this.repo.softDelete(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to delete listing');
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private assertOwnership(listing: Listing, requesterId: string): void {
    if (listing.userId !== requesterId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }
}
