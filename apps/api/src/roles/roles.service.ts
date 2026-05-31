import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ROLES_REPOSITORY, type IRolesRepository } from './interfaces/roles-repository.interface';
import { type Role } from './domain/role';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly repo: IRolesRepository,
  ) {}

  async findAll(): Promise<Role[]> {
    try {
      return await this.repo.findAll();
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve roles');
    }
  }

  async findById(id: string): Promise<Role> {
    try {
      const role = await this.repo.findById(id);
      if (!role) throw new NotFoundException(`Role ${id} not found`);
      return role;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve role');
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      return await this.repo.findByName(name);
    } catch (err) {
      throw new InternalServerErrorException(`Failed to retrieve role by name: ${name}`, {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }
}
