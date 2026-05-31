import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  MinLength,
  IsPostalCode,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ListingType, PropertyType } from '../domain/listing';

export class UpdateListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: ['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'] })
  @IsOptional()
  @IsEnum(['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'])
  listingType?: ListingType;

  @ApiPropertyOptional({ enum: ['detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other'] })
  @IsOptional()
  @IsEnum(['detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other'])
  propertyType?: PropertyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  askingPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyRent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPostalCode('GB')
  postcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;
}
