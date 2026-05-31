import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Category, CategoryTreeNode } from '../domain/category';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromDomain(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.parentId = category.parentId;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.description = category.description;
    dto.sortOrder = category.sortOrder;
    dto.createdAt = category.createdAt.toISOString();
    dto.updatedAt = category.updatedAt.toISOString();
    return dto;
  }
}

export class CategoryTreeNodeDto extends CategoryResponseDto {
  @ApiProperty({ type: () => [CategoryTreeNodeDto] })
  children: CategoryTreeNodeDto[];

  static fromTreeNode(node: CategoryTreeNode): CategoryTreeNodeDto {
    const dto = new CategoryTreeNodeDto();
    dto.id = node.id;
    dto.parentId = node.parentId;
    dto.name = node.name;
    dto.slug = node.slug;
    dto.description = node.description;
    dto.sortOrder = node.sortOrder;
    dto.createdAt = node.createdAt.toISOString();
    dto.updatedAt = node.updatedAt.toISOString();
    dto.children = node.children.map((child) => CategoryTreeNodeDto.fromTreeNode(child));
    return dto;
  }
}
