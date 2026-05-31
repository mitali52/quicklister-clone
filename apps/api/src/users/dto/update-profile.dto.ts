import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Smith', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must be at most 100 characters' })
  fullName?: string;

  @ApiPropertyOptional({ example: '07700900000' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+44|0)\d{10}$/, { message: 'Enter a valid UK phone number (e.g. 07700 900000)' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '12 Example Street', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Flat 3', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'London', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Greater London', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  county?: string;

  @ApiPropertyOptional({ example: 'SW1A 1AA' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, {
    message: 'Enter a valid UK postcode',
  })
  postcode?: string;
}
