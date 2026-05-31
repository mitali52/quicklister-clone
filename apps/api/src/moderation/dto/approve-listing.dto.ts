import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveListingDto {
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}
