import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model';
import type { Role } from './domain/role';
import type { IRolesRepository } from './interfaces/roles-repository.interface';

function toDomain(role: RoleModel): Role {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions?.map((permission) => permission.name) ?? [],
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
  ) {}

  private readonly roleIncludes = [
    {
      model: PermissionModel,
      through: { attributes: [] },
      attributes: ['name'],
      required: false,
    },
  ];

  async findAll(): Promise<Role[]> {
    const roles = await this.roleModel.findAll({
      include: this.roleIncludes,
      order: [['name', 'ASC']],
    });
    return roles.map(toDomain);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.roleModel.findByPk(id, {
      include: this.roleIncludes,
    });
    return role ? toDomain(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleModel.findOne({
      where: { name },
      include: this.roleIncludes,
    });
    return role ? toDomain(role) : null;
  }
}
