import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ListingType, PropertyType } from '../../listings/domain/listing';
import type { SortOption } from '../domain/listing-search';

export class SearchListingsDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  q?: string;

  @IsEnum(['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'])
  @IsOptional()
  listingType?: ListingType;

  @IsEnum([
    'detached', 'semi_detached', 'terraced', 'flat',
    'bungalow', 'maisonette', 'studio', 'other',
  ])
  @IsOptional()
  propertyType?: PropertyType;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minBedrooms?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxBedrooms?: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  postcodePrefix?: string;

  @IsEnum(['newest', 'oldest', 'price_asc', 'price_desc', 'bedrooms_asc', 'bedrooms_desc'])
  @IsOptional()
  sortBy?: SortOption;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
