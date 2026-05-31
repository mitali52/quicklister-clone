import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsUrl, Matches } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Lettings Ltd' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'acme-lettings-ltd' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-logo.png' })
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
