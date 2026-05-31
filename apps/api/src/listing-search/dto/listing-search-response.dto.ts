import type { ListingType, PropertyType } from '../../listings/domain/listing';
import type { ListingSearchItem, PaginatedListingSearchResult } from '../domain/listing-search';

export class ListingSearchItemDto {
  id!: string;
  userId!: string;
  title!: string;
  listingType!: ListingType;
  propertyType!: PropertyType;
  askingPrice!: number | null;
  monthlyRent!: number | null;
  addressLine1!: string;
  addressLine2!: string | null;
  city!: string;
  postcode!: string;
  bedrooms!: number | null;
  bathrooms!: number | null;
  primaryPhotoUrl!: string | null;
  createdAt!: string;

  static fromDomain(item: ListingSearchItem): ListingSearchItemDto {
    const dto = new ListingSearchItemDto();
    dto.id = item.id;
    dto.userId = item.userId;
    dto.title = item.title;
    dto.listingType = item.listingType;
    dto.propertyType = item.propertyType;
    dto.askingPrice = item.askingPrice;
    dto.monthlyRent = item.monthlyRent;
    dto.addressLine1 = item.addressLine1;
    dto.addressLine2 = item.addressLine2;
    dto.city = item.city;
    dto.postcode = item.postcode;
    dto.bedrooms = item.bedrooms;
    dto.bathrooms = item.bathrooms;
    dto.primaryPhotoUrl = item.primaryPhotoUrl;
    dto.createdAt = item.createdAt.toISOString();
    return dto;
  }
}

export class ListingSearchMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class ListingSearchResponseDto {
  data!: ListingSearchItemDto[];
  meta!: ListingSearchMetaDto;

  static fromDomain(result: PaginatedListingSearchResult): ListingSearchResponseDto {
    const dto = new ListingSearchResponseDto();
    dto.data = result.items.map((item) => ListingSearchItemDto.fromDomain(item));
    dto.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
