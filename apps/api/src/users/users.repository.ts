import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../database/models/user.model';
import type { User, CreateUserData, UpdateUserData } from './domain/user';
import type {
  IUsersRepository,
  PaginationOpts,
  PaginatedResult,
} from './interfaces/users-repository.interface';

function toDomain(user: UserModel): User {
  return {
    id: user.id,
    roleId: user.roleId,
    email: user.email,
    passwordHash: user.passwordHash,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    county: user.county,
    postcode: user.postcode,
    emailVerified: user.emailVerified,
    nrlaMember: user.nrlaMember,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  async findAll(opts: PaginationOpts): Promise<PaginatedResult<User>> {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;

    const result = await this.userModel.findAndCountAll({
      where: { deletedAt: null },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: result.rows.map(toDomain),
      total: result.count,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { id, deletedAt: null },
    });
    return user ? toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email, deletedAt: null },
    });
    return user ? toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.userModel.create({
      roleId: data.roleId,
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber ?? null,
      emailVerified: false,
      nrlaMember: false,
    });
    return toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user || user.deletedAt !== null) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await user.update({
      fullName: data.fullName ?? user.fullName,
      phoneNumber: data.phoneNumber ?? user.phoneNumber,
      addressLine1: data.addressLine1 ?? user.addressLine1,
      addressLine2: data.addressLine2 ?? user.addressLine2,
      city: data.city ?? user.city,
      county: data.county ?? user.county,
      postcode: data.postcode ?? user.postcode,
    });
    return toDomain(user);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user || user.deletedAt !== null) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await user.update({ avatarUrl });
    return toDomain(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (!user || user.deletedAt !== null) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await user.update({ passwordHash });
  }

  async softDelete(id: string): Promise<void> {
    await this.userModel.destroy({
      where: { id },
    });
  }
}
