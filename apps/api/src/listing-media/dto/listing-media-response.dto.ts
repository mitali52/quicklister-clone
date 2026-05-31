import type { ListingMedia } from '../domain/listing-media';

export class ListingMediaResponseDto {
  id: string;
  listingId: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;

  static fromDomain(media: ListingMedia): ListingMediaResponseDto {
    const dto = new ListingMediaResponseDto();
    dto.id = media.id;
    dto.listingId = media.listingId;
    dto.url = media.url;
    dto.filename = media.filename;
    dto.mimeType = media.mimeType;
    dto.sizeBytes = media.sizeBytes;
    dto.sortOrder = media.sortOrder;
    dto.isPrimary = media.isPrimary;
    dto.createdAt = media.createdAt.toISOString();
    dto.updatedAt = media.updatedAt.toISOString();
    return dto;
  }
}
