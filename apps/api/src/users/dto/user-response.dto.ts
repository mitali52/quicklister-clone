import { type User } from '../domain/user';

export class UserResponseDto {
  id: string;
  roleId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  emailVerified: boolean;
  nrlaMember: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.roleId = user.roleId;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.phoneNumber = user.phoneNumber;
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
