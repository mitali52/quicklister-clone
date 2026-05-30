import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { ROLES_REPOSITORY } from './interfaces/roles-repository.interface';

@Module({
  controllers: [RolesController],
  providers: [
    { provide: ROLES_REPOSITORY, useClass: RolesRepository },
    RolesService,
  ],
  exports: [RolesService],
})
export class RolesModule {}
