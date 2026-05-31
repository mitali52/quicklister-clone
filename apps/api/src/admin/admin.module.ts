import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ADMIN_REPOSITORY } from './interfaces/admin-repository.interface';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: ADMIN_REPOSITORY, useClass: AdminRepository },
    AdminService,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
