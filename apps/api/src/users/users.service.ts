import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type IUsersRepository,
  type PaginationOpts,
  type PaginatedResult,
} from './interfaces/users-repository.interface';
import { type User } from './domain/user';
import { type CreateUserDto } from './dto/create-user.dto';
import { type UpdateUserDto } from './dto/update-user.dto';
import { type UpdateProfileDto } from './dto/update-profile.dto';
import { type ChangePasswordDto } from './dto/change-password.dto';
import { hashPassword, verifyPassword } from '../common/helpers/crypto.helper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly repo: IUsersRepository,
  ) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<User>> {
    try {
      return await this.repo.findAll(opts);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.repo.findById(id);
      if (!user) throw new NotFoundException(`User ${id} not found`);
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repo.findByEmail(email);
    } catch (err) {
      throw new InternalServerErrorException('Failed to look up user by email', {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing) throw new ConflictException(`Email ${dto.email} is already registered`);

      const passwordHash = await hashPassword(dto.password);

      return await this.repo.create({
        roleId: dto.roleId,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`User ${id} not found`);

      return await this.repo.update(id, {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        county: dto.county,
        postcode: dto.postcode,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`User ${id} not found`);

      await this.repo.softDelete(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  // ── Self-service profile methods (authenticated user acting on their own data) ──

  async getProfile(userId: string): Promise<User> {
    try {
      const user = await this.repo.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve profile');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    try {
      const existing = await this.repo.findById(userId);
      if (!existing) throw new NotFoundException('User not found');

      return await this.repo.update(userId, {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        county: dto.county,
        postcode: dto.postcode,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    try {
      const existing = await this.repo.findById(userId);
      if (!existing) throw new NotFoundException('User not found');

      return await this.repo.updateAvatar(userId, avatarUrl);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update avatar');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    try {
      const user = await this.repo.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      const isValid = await verifyPassword(dto.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (dto.currentPassword === dto.newPassword) {
        throw new BadRequestException('New password must be different from the current password');
      }

      await this.setPassword(userId, dto.newPassword);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async setPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const user = await this.repo.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      const newHash = await hashPassword(newPassword);
      await this.repo.updatePassword(userId, newHash);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      const existing = await this.repo.findById(userId);
      if (!existing) throw new NotFoundException('User not found');

      await this.repo.softDelete(userId);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
