import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectListingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  notes!: string;
}
