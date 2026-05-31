import { IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({
    description: 'Public S3 URL of the uploaded avatar image',
    example: 'https://quicklister-photos-dev.s3.eu-west-2.amazonaws.com/avatars/user-id.jpg',
    maxLength: 2000,
  })
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  @MaxLength(2000)
  avatarUrl: string;
}
