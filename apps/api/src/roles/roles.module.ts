import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { ROLES_REPOSITORY } from './interfaces/roles-repository.interface';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model';
import { RolePermissionModel } from '../database/models/role-permission.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      RoleModel,
      PermissionModel,
      RolePermissionModel,
    ]),
  ],
  controllers: [RolesController],
  providers: [
    { provide: ROLES_REPOSITORY, useClass: RolesRepository },
    RolesService,
  ],
  exports: [RolesService],
})
export class RolesModule {}
