import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CATEGORIES_REPOSITORY,
  type ICategoriesRepository,
} from './interfaces/categories-repository.interface';
import type { Category } from './domain/category';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-uuid-1',
    parentId: null,
    name: 'Residential Sales',
    slug: 'residential-sales',
    description: 'Properties for sale across the UK',
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildCreateDto(overrides: Partial<{ parentId?: string; name: string; slug: string; description?: string; sortOrder?: number }> = {}) {
  return {
    name: 'Residential Sales',
    slug: 'residential-sales',
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<ICategoriesRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findChildren: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const providers = new Map([[CATEGORIES_REPOSITORY, repo]]);
    service = new CategoriesService(providers.get(CATEGORIES_REPOSITORY) as ICategoriesRepository);
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all categories', async () => {
      repo.findAll.mockResolvedValue([buildCategory()]);

      const result = await service.findAll();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db down'));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── findTree ───────────────────────────────────────────────────────────────

  describe('findTree', () => {
    it('returns nested tree with children under their parent', async () => {
      const parent = buildCategory({ id: 'parent-1', parentId: null, name: 'Parent' });
      const child = buildCategory({ id: 'child-1', parentId: 'parent-1', name: 'Child' });
      repo.findAll.mockResolvedValue([parent, child]);

      const tree = await service.findTree();

      expect(tree).toHaveLength(1);
      expect(tree[0]?.id).toBe('parent-1');
      expect(tree[0]?.children).toHaveLength(1);
      expect(tree[0]?.children[0]?.id).toBe('child-1');
    });

    it('returns multiple root nodes when multiple top-level categories exist', async () => {
      repo.findAll.mockResolvedValue([
        buildCategory({ id: 'root-1', parentId: null }),
        buildCategory({ id: 'root-2', parentId: null, slug: 'other' }),
      ]);

      const tree = await service.findTree();

      expect(tree).toHaveLength(2);
    });

    it('places orphaned nodes at root level when parent is missing', async () => {
      const orphan = buildCategory({ id: 'orphan', parentId: 'non-existent' });
      repo.findAll.mockResolvedValue([orphan]);

      const tree = await service.findTree();

      expect(tree).toHaveLength(1);
      expect(tree[0]?.id).toBe('orphan');
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db error'));

      await expect(service.findTree()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the category when it exists', async () => {
      const category = buildCategory();
      repo.findById.mockResolvedValue(category);

      const result = await service.findById('cat-uuid-1');

      expect(result).toEqual(category);
    });

    it('throws NotFoundException when category does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findBySlug ────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('returns the category when slug matches', async () => {
      repo.findBySlug.mockResolvedValue(buildCategory());

      const result = await service.findBySlug('residential-sales');

      expect(result.slug).toBe('residential-sales');
    });

    it('throws NotFoundException when slug has no match', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown-slug')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates and returns a category', async () => {
      const category = buildCategory();
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(category);

      const result = await service.create(buildCreateDto());

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Residential Sales', slug: 'residential-sales' }),
      );
      expect(result).toEqual(category);
    });

    it('throws ConflictException when slug is already taken', async () => {
      repo.findBySlug.mockResolvedValue(buildCategory());

      await expect(service.create(buildCreateDto())).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException when parent does not exist', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);

      await expect(
        service.create(buildCreateDto({ parentId: 'ghost-parent' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a child category under a valid parent', async () => {
      const parent = buildCategory({ id: 'parent-id' });
      const child = buildCategory({ id: 'child-id', parentId: 'parent-id', slug: 'child-slug' });
      repo.findBySlug.mockResolvedValue(null);
      repo.findById.mockResolvedValue(parent);
      repo.create.mockResolvedValue(child);

      const result = await service.create(buildCreateDto({ parentId: 'parent-id', slug: 'child-slug' }));

      expect(result.parentId).toBe('parent-id');
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockRejectedValue(new Error('db error'));

      await expect(service.create(buildCreateDto())).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the category', async () => {
      const existing = buildCategory();
      const updated = buildCategory({ name: 'Updated Name' });
      repo.findById.mockResolvedValue(existing);
      repo.findBySlug.mockResolvedValue(null);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('cat-uuid-1', { name: 'Updated Name' });

      expect(repo.update).toHaveBeenCalledWith('cat-uuid-1', expect.objectContaining({ name: 'Updated Name' }));
      expect(result.name).toBe('Updated Name');
    });

    it('throws NotFoundException when category does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when new slug is already taken by another category', async () => {
      const existing = buildCategory({ slug: 'old-slug' });
      const conflict = buildCategory({ id: 'other-id', slug: 'taken-slug' });
      repo.findById.mockResolvedValue(existing);
      repo.findBySlug.mockResolvedValue(conflict);

      await expect(service.update('cat-uuid-1', { slug: 'taken-slug' })).rejects.toThrow(ConflictException);
    });

    it('does not slug-conflict-check when slug is unchanged', async () => {
      const existing = buildCategory({ slug: 'residential-sales' });
      const updated = buildCategory();
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      await service.update('cat-uuid-1', { slug: 'residential-sales' });

      expect(repo.findBySlug).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when setting parent creates a cycle', async () => {
      // cat-uuid-1 is parent of child-uuid; cannot set cat-uuid-1's parent = child-uuid
      const existing = buildCategory({ id: 'cat-uuid-1' });
      const child = buildCategory({ id: 'child-uuid', parentId: 'cat-uuid-1' });
      repo.findById
        .mockResolvedValueOnce(existing) // update: findById('cat-uuid-1')
        .mockResolvedValueOnce(child)    // assertParentExists: findById('child-uuid')
        .mockResolvedValueOnce(child);   // assertNoCycle: findById('child-uuid') → parentId = 'cat-uuid-1' → cycle

      await expect(
        service.update('cat-uuid-1', { parentId: 'child-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes a leaf category successfully', async () => {
      repo.findById.mockResolvedValue(buildCategory());
      repo.findChildren.mockResolvedValue([]);
      repo.delete.mockResolvedValue(undefined);

      await service.remove('cat-uuid-1');

      expect(repo.delete).toHaveBeenCalledWith('cat-uuid-1');
    });

    it('throws NotFoundException when category does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when category has subcategories', async () => {
      repo.findById.mockResolvedValue(buildCategory());
      repo.findChildren.mockResolvedValue([buildCategory({ id: 'child-1' })]);

      await expect(service.remove('cat-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildCategory());
      repo.findChildren.mockResolvedValue([]);
      repo.delete.mockRejectedValue(new Error('db error'));

      await expect(service.remove('cat-uuid-1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
