import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PERMISSIONS_REPOSITORY, type IPermissionsRepository } from './interfaces/permissions-repository.interface';
import type { Permission } from './domain/permission';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSIONS_REPOSITORY)
    private readonly repo: IPermissionsRepository,
  ) {}

  async findAll(): Promise<Permission[]> {
    try {
      return await this.repo.findAll();
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve permissions');
    }
  }

  async findById(id: string): Promise<Permission> {
    try {
      const permission = await this.repo.findById(id);
      if (!permission) throw new NotFoundException(`Permission ${id} not found`);
      return permission;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to retrieve permission');
    }
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
      return await this.repo.findByName(name);
    } catch (err) {
      throw new InternalServerErrorException(`Failed to retrieve permission by name: ${name}`, {
        cause: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }
}
