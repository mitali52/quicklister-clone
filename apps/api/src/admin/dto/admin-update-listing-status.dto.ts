import { IsEnum, IsNotEmpty } from 'class-validator';
import type { ListingStatus } from '../../listings/domain/listing';

export class AdminUpdateListingStatusDto {
  @IsEnum(['draft', 'pending_review', 'published', 'archived'])
  @IsNotEmpty()
  status!: ListingStatus;
}
