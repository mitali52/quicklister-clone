import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type User } from '../domain/user';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  roleId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane Smith' })
  fullName: string;

  @ApiPropertyOptional({ example: '07700900000', nullable: true })
  phoneNumber: string | null;

  @ApiPropertyOptional({
    example: 'https://quicklister-photos-dev.s3.eu-west-2.amazonaws.com/avatars/user-id.jpg',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiPropertyOptional({ example: '12 Example Street', nullable: true })
  addressLine1: string | null;

  @ApiPropertyOptional({ example: 'Flat 3', nullable: true })
  addressLine2: string | null;

  @ApiPropertyOptional({ example: 'London', nullable: true })
  city: string | null;

  @ApiPropertyOptional({ example: 'Greater London', nullable: true })
  county: string | null;

  @ApiPropertyOptional({ example: 'SW1A 1AA', nullable: true })
  postcode: string | null;

  @ApiProperty({ example: false })
  emailVerified: boolean;

  @ApiProperty({ example: false })
  nrlaMember: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.roleId = user.roleId;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.phoneNumber = user.phoneNumber;
    dto.avatarUrl = user.avatarUrl;
    dto.addressLine1 = user.addressLine1;
    dto.addressLine2 = user.addressLine2;
    dto.city = user.city;
    dto.county = user.county;
    dto.postcode = user.postcode;
    dto.emailVerified = user.emailVerified;
    dto.nrlaMember = user.nrlaMember;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto; // passwordHash deliberately excluded
  }
}
