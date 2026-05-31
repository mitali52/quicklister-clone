import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Organization } from '../domain/organization';

export class OrganizationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() ownerId: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiPropertyOptional() description: string | null;
  @ApiPropertyOptional() logoUrl: string | null;
  @ApiPropertyOptional() websiteUrl: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;

  static fromDomain(org: Organization): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    dto.id = org.id;
    dto.ownerId = org.ownerId;
    dto.name = org.name;
    dto.slug = org.slug;
    dto.description = org.description;
    dto.logoUrl = org.logoUrl;
    dto.websiteUrl = org.websiteUrl;
    dto.createdAt = org.createdAt.toISOString();
    dto.updatedAt = org.updatedAt.toISOString();
    return dto;
  }
}
