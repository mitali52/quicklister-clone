export class CreateUserDto {
  roleId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}
