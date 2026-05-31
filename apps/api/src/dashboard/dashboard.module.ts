import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DASHBOARD_REPOSITORY } from './interfaces/dashboard-repository.interface';
import { MODERATOR_DASHBOARD_REPOSITORY } from './interfaces/moderator-dashboard-repository.interface';
import { ADMIN_DASHBOARD_REPOSITORY } from './interfaces/admin-dashboard-repository.interface';
import { DashboardRepository } from './dashboard.repository';
import { ModeratorDashboardRepository } from './moderator-dashboard.repository';
import { AdminDashboardRepository } from './admin-dashboard.repository';
import { DashboardService } from './dashboard.service';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ModeratorDashboardController } from './moderator-dashboard.controller';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    { provide: MODERATOR_DASHBOARD_REPOSITORY, useClass: ModeratorDashboardRepository },
    { provide: ADMIN_DASHBOARD_REPOSITORY, useClass: AdminDashboardRepository },
    DashboardService,
    ModeratorDashboardService,
    AdminDashboardService,
  ],
  controllers: [DashboardController, ModeratorDashboardController, AdminDashboardController],
})
export class DashboardModule {}
