import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import {
  ORGANIZATIONS_REPOSITORY,
  type IOrganizationsRepository,
} from './interfaces/organizations-repository.interface';
import type { Organization } from './domain/organization';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildOrganization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: 'org-uuid-1',
    ownerId: 'user-uuid-1',
    name: 'Acme Lettings',
    slug: 'acme-lettings',
    description: null,
    logoUrl: null,
    websiteUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

function buildPaginatedResult<T>(data: T[]) {
  return { data, total: data.length, page: 1, limit: 20 };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: jest.Mocked<IOrganizationsRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByOwnerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const providers = new Map([[ORGANIZATIONS_REPOSITORY, repo]]);
    service = new OrganizationsService(
      providers.get(ORGANIZATIONS_REPOSITORY) as IOrganizationsRepository,
    );
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated organizations', async () => {
      const org = buildOrganization();
      repo.findAll.mockResolvedValue(buildPaginatedResult([org]));

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db down'));

      await expect(service.findAll({ page: 1, limit: 20 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the organization when found', async () => {
      const org = buildOrganization();
      repo.findById.mockResolvedValue(org);

      const result = await service.findById(org.id);

      expect(result).toEqual(org);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockRejectedValue(new Error('db error'));

      await expect(service.findById('org-uuid-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── findBySlug ────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('returns the organization when slug matches', async () => {
      const org = buildOrganization();
      repo.findBySlug.mockResolvedValue(org);

      const result = await service.findBySlug('acme-lettings');

      expect(result).toEqual(org);
    });

    it('throws NotFoundException when slug is not found', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown-slug')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findMyOrganizations ───────────────────────────────────────────────────

  describe('findMyOrganizations', () => {
    it('returns organizations owned by the user', async () => {
      const org = buildOrganization();
      repo.findByOwnerId.mockResolvedValue(buildPaginatedResult([org]));

      const result = await service.findMyOrganizations('user-uuid-1', { page: 1, limit: 20 });

      expect(repo.findByOwnerId).toHaveBeenCalledWith('user-uuid-1', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findByOwnerId.mockRejectedValue(new Error('db error'));

      await expect(
        service.findMyOrganizations('user-uuid-1', { page: 1, limit: 20 }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates and returns the organization when slug is available', async () => {
      repo.findBySlug.mockResolvedValue(null);
      const org = buildOrganization();
      repo.create.mockResolvedValue(org);

      const result = await service.create('user-uuid-1', {
        name: 'Acme Lettings',
        slug: 'acme-lettings',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 'user-uuid-1', slug: 'acme-lettings' }),
      );
      expect(result).toEqual(org);
    });

    it('throws ConflictException when slug is already taken', async () => {
      repo.findBySlug.mockResolvedValue(buildOrganization());

      await expect(
        service.create('user-uuid-1', { name: 'Other', slug: 'acme-lettings' }),
      ).rejects.toThrow(ConflictException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockRejectedValue(new Error('db error'));

      await expect(
        service.create('user-uuid-1', { name: 'Test', slug: 'test-slug' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the organization when owner requests', async () => {
      const org = buildOrganization();
      const updated = buildOrganization({ name: 'Acme Lettings Ltd' });
      repo.findById.mockResolvedValue(org);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(org.id, 'user-uuid-1', { name: 'Acme Lettings Ltd' });

      expect(repo.update).toHaveBeenCalledWith(
        org.id,
        expect.objectContaining({ name: 'Acme Lettings Ltd' }),
      );
      expect(result.name).toBe('Acme Lettings Ltd');
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      repo.findById.mockResolvedValue(buildOrganization({ ownerId: 'owner-uuid' }));

      await expect(
        service.update('org-uuid-1', 'other-user-uuid', { name: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when organization does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('missing', 'user-uuid-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new slug is already taken by another org', async () => {
      repo.findById.mockResolvedValue(buildOrganization({ slug: 'old-slug' }));
      repo.findBySlug.mockResolvedValue(buildOrganization({ id: 'other-org', slug: 'taken-slug' }));

      await expect(
        service.update('org-uuid-1', 'user-uuid-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('allows owner to keep the same slug without conflict', async () => {
      const org = buildOrganization({ slug: 'acme-lettings' });
      const updated = buildOrganization();
      repo.findById.mockResolvedValue(org);
      repo.update.mockResolvedValue(updated);

      // slug is undefined in dto — no slug check should occur
      await service.update('org-uuid-1', 'user-uuid-1', { name: 'Updated Name' });

      expect(repo.findBySlug).not.toHaveBeenCalled();
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes the organization when owner requests', async () => {
      repo.findById.mockResolvedValue(buildOrganization());
      repo.softDelete.mockResolvedValue(undefined);

      await service.remove('org-uuid-1', 'user-uuid-1');

      expect(repo.softDelete).toHaveBeenCalledWith('org-uuid-1');
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      repo.findById.mockResolvedValue(buildOrganization({ ownerId: 'real-owner' }));

      await expect(service.remove('org-uuid-1', 'not-the-owner')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when organization does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildOrganization());
      repo.softDelete.mockRejectedValue(new Error('db error'));

      await expect(service.remove('org-uuid-1', 'user-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
