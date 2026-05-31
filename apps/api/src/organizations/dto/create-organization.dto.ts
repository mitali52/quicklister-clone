import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Lettings', description: 'Display name of the organization' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'acme-lettings',
    description: 'URL-safe unique slug (lowercase letters, numbers, hyphens)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'We help landlords list without agents.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl must be a valid URL' })
  @MaxLength(2000)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://acmelettings.co.uk' })
  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  @MaxLength(2000)
  websiteUrl?: string;
}
