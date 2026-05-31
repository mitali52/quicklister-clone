import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DASHBOARD_REPOSITORY } from './interfaces/dashboard-repository.interface';
import { DashboardRepository } from './dashboard.repository';
import { UserDashboardService } from './dashboard.service';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { UserDashboardController } from './dashboard.controller';
import { ModeratorDashboardController } from './moderator-dashboard.controller';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    UserDashboardService,
    ModeratorDashboardService,
    AdminDashboardService,
  ],
  controllers: [UserDashboardController, ModeratorDashboardController, AdminDashboardController],
})
export class DashboardModule {}
