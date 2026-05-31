import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
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

  async create(_dto: CreateUserDto): Promise<User> {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: string, _dto: UpdateUserDto): Promise<User> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`User ${id} not found`);
      throw new Error('Not implemented');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`User ${id} not found`);
      throw new Error('Not implemented');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
