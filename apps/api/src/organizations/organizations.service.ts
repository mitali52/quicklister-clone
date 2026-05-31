import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ORGANIZATIONS_REPOSITORY,
  type IOrganizationsRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/organizations-repository.interface';
import type { Organization } from './domain/organization';
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(ORGANIZATIONS_REPOSITORY)
    private readonly repo: IOrganizationsRepository,
  ) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<Organization>> {
    try {
      return await this.repo.findAll(opts);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organizations');
    }
  }

  async findById(id: string): Promise<Organization> {
    try {
      const org = await this.repo.findById(id);
      if (!org) throw new NotFoundException(`Organization ${id} not found`);
      return org;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organization');
    }
  }

  async findBySlug(slug: string): Promise<Organization> {
    try {
      const org = await this.repo.findBySlug(slug);
      if (!org) throw new NotFoundException(`Organization with slug "${slug}" not found`);
      return org;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organization');
    }
  }

  async findMyOrganizations(ownerId: string, opts: PaginationOpts): Promise<PaginatedResult<Organization>> {
    try {
      return await this.repo.findByOwnerId(ownerId, opts);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve organizations');
    }
  }

  async create(ownerId: string, dto: CreateOrganizationDto): Promise<Organization> {
    try {
      const slugTaken = await this.repo.findBySlug(dto.slug);
      if (slugTaken) throw new ConflictException(`Slug "${dto.slug}" is already taken`);

      return await this.repo.create({
        ownerId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create organization');
    }
  }

  async update(id: string, requesterId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    try {
      const org = await this.repo.findById(id);
      if (!org) throw new NotFoundException(`Organization ${id} not found`);

      this.assertOwnership(org, requesterId);

      if (dto.slug !== undefined && dto.slug !== org.slug) {
        const slugTaken = await this.repo.findBySlug(dto.slug);
        if (slugTaken) throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }

      return await this.repo.update(id, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update organization');
    }
  }

  async remove(id: string, requesterId: string): Promise<void> {
    try {
      const org = await this.repo.findById(id);
      if (!org) throw new NotFoundException(`Organization ${id} not found`);

      this.assertOwnership(org, requesterId);

      await this.repo.softDelete(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to delete organization');
    }
  }

  private assertOwnership(org: Organization, requesterId: string): void {
    if (org.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this organization');
    }
  }
}
