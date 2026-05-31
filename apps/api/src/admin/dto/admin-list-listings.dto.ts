import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { ListingStatus, ListingType } from '../../listings/domain/listing';

export class AdminListListingsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['draft', 'pending_review', 'published', 'archived'])
  status?: ListingStatus;

  @IsOptional()
  @IsEnum(['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'])
  listingType?: ListingType;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
