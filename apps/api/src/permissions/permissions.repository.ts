import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PermissionModel } from '../database/models/permission.model';
import type { Permission } from './domain/permission';
import type { IPermissionsRepository } from './interfaces/permissions-repository.interface';

function toDomain(permission: PermissionModel): Permission {
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

@Injectable()
export class PermissionsRepository implements IPermissionsRepository {
  constructor(
    @InjectModel(PermissionModel)
    private readonly permissionModel: typeof PermissionModel,
  ) {}

  async findAll(): Promise<Permission[]> {
    const permissions = await this.permissionModel.findAll({
      order: [['name', 'ASC']],
    });
    return permissions.map(toDomain);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.permissionModel.findByPk(id);
    return permission ? toDomain(permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.permissionModel.findOne({ where: { name } });
    return permission ? toDomain(permission) : null;
  }
}
