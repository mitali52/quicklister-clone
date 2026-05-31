import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CATEGORIES_REPOSITORY,
  type ICategoriesRepository,
} from './interfaces/categories-repository.interface';
import type { Category, CategoryTreeNode, CreateCategoryData, UpdateCategoryData } from './domain/category';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly repo: ICategoriesRepository,
  ) {}

  // ── Public: flat list ─────────────────────────────────────────────────────

  async findAll(): Promise<Category[]> {
    try {
      return await this.repo.findAll();
    } catch (err) {
      throw new InternalServerErrorException('Failed to retrieve categories');
    }
  }

  // ── Public: category tree ─────────────────────────────────────────────────

  async findTree(): Promise<CategoryTreeNode[]> {
    try {
      const categories = await this.repo.findAll();
      return this.buildTree(categories);
    } catch (err) {
      throw new InternalServerErrorException('Failed to build category tree');
    }
  }

  // ── Public: single category ───────────────────────────────────────────────

  async findById(id: string): Promise<Category> {
    try {
      const category = await this.repo.findById(id);
      if (!category) throw new NotFoundException(`Category ${id} not found`);
      return category;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve category');
    }
  }

  async findBySlug(slug: string): Promise<Category> {
    try {
      const category = await this.repo.findBySlug(slug);
      if (!category) throw new NotFoundException(`Category with slug "${slug}" not found`);
      return category;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve category');
    }
  }

  // ── Admin: create ─────────────────────────────────────────────────────────

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      await this.assertSlugUnique(dto.slug);

      if (dto.parentId) {
        await this.assertParentExists(dto.parentId);
      }

      const data: CreateCategoryData = {
        parentId: dto.parentId ?? null,
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? 0,
      };

      return await this.repo.create(data);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  // ── Admin: update ─────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`Category ${id} not found`);

      if (dto.slug && dto.slug !== existing.slug) {
        await this.assertSlugUnique(dto.slug);
      }

      if (dto.parentId) {
        await this.assertParentExists(dto.parentId);
        await this.assertNoCycle(id, dto.parentId);
      }

      const data: UpdateCategoryData = {
        parentId: dto.parentId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        sortOrder: dto.sortOrder,
      };

      return await this.repo.update(id, data);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof BadRequestException) throw err;
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  // ── Admin: delete ─────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    try {
      const category = await this.repo.findById(id);
      if (!category) throw new NotFoundException(`Category ${id} not found`);

      const children = await this.repo.findChildren(id);
      if (children.length > 0) {
        throw new BadRequestException(
          'Cannot delete a category that has subcategories. Remove or re-parent subcategories first.',
        );
      }

      await this.repo.delete(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const nodeMap = new Map<string, CategoryTreeNode>();

    for (const cat of categories) {
      nodeMap.set(cat.id, { ...cat, children: [] });
    }

    const roots: CategoryTreeNode[] = [];

    for (const node of nodeMap.values()) {
      if (node.parentId === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    }

    return roots;
  }

  private async assertSlugUnique(slug: string): Promise<void> {
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`A category with slug "${slug}" already exists`);
    }
  }

  private async assertParentExists(parentId: string): Promise<void> {
    const parent = await this.repo.findById(parentId);
    if (!parent) {
      throw new BadRequestException(`Parent category ${parentId} does not exist`);
    }
  }

  private async assertNoCycle(categoryId: string, newParentId: string): Promise<void> {
    // Walk up the ancestor chain of newParentId — if we encounter categoryId, it's a cycle
    let currentId: string | null = newParentId;
    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new BadRequestException('Cannot set a category as its own ancestor (circular hierarchy)');
      }
      const parent = await this.repo.findById(currentId);
      currentId = parent?.parentId ?? null;
    }
  }
}
