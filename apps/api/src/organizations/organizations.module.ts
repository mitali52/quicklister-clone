import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { ORGANIZATIONS_REPOSITORY } from './interfaces/organizations-repository.interface';

@Module({
  controllers: [OrganizationsController],
  providers: [
    { provide: ORGANIZATIONS_REPOSITORY, useClass: OrganizationsRepository },
    OrganizationsService,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
