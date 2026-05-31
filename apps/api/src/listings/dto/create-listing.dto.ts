import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  MinLength,
  IsPostalCode,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ListingType, PropertyType } from '../domain/listing';

export class CreateListingDto {
  @ApiProperty({ example: 'Bright 2-bed flat in Islington' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Lovely period flat with original features.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: ['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'] })
  @IsEnum(['residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'])
  listingType: ListingType;

  @ApiProperty({ enum: ['detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other'] })
  @IsEnum(['detached', 'semi_detached', 'terraced', 'flat', 'bungalow', 'maisonette', 'studio', 'other'])
  propertyType: PropertyType;

  @ApiPropertyOptional({ example: 45000000, description: 'Asking price in pence' })
  @IsOptional()
  @IsInt()
  @Min(1)
  askingPrice?: number;

  @ApiPropertyOptional({ example: 200000, description: 'Monthly rent in pence' })
  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyRent?: number;

  @ApiProperty({ example: '12 Baker Street' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Flat 2' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NW1 6XE' })
  @IsPostalCode('GB')
  postcode: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;
}
