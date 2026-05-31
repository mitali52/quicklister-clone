import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Listing, ListingStatus, ListingType, PropertyType } from '../domain/listing';

export class ListingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() listingType: ListingType;
  @ApiProperty() propertyType: PropertyType;
  @ApiProperty() status: ListingStatus;
  @ApiPropertyOptional() askingPrice: number | null;
  @ApiPropertyOptional() monthlyRent: number | null;
  @ApiProperty() addressLine1: string;
  @ApiPropertyOptional() addressLine2: string | null;
  @ApiProperty() city: string;
  @ApiProperty() postcode: string;
  @ApiPropertyOptional() bedrooms: number | null;
  @ApiPropertyOptional() bathrooms: number | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;

  static fromDomain(listing: Listing): ListingResponseDto {
    const dto = new ListingResponseDto();
    dto.id = listing.id;
    dto.userId = listing.userId;
    dto.title = listing.title;
    dto.description = listing.description;
    dto.listingType = listing.listingType;
    dto.propertyType = listing.propertyType;
    dto.status = listing.status;
    dto.askingPrice = listing.askingPrice;
    dto.monthlyRent = listing.monthlyRent;
    dto.addressLine1 = listing.addressLine1;
    dto.addressLine2 = listing.addressLine2;
    dto.city = listing.city;
    dto.postcode = listing.postcode;
    dto.bedrooms = listing.bedrooms;
    dto.bathrooms = listing.bathrooms;
    dto.createdAt = listing.createdAt.toISOString();
    dto.updatedAt = listing.updatedAt.toISOString();
    return dto;
  }
}
