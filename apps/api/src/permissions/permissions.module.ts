import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PermissionModel } from '../database/models/permission.model';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsService } from './permissions.service';
import { PERMISSIONS_REPOSITORY } from './interfaces/permissions-repository.interface';

@Module({
  imports: [SequelizeModule.forFeature([PermissionModel])],
  controllers: [PermissionsController],
  providers: [
    { provide: PERMISSIONS_REPOSITORY, useClass: PermissionsRepository },
    PermissionsService,
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
