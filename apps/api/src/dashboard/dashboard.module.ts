import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DASHBOARD_REPOSITORY } from './interfaces/dashboard-repository.interface';
import { MODERATOR_DASHBOARD_REPOSITORY } from './interfaces/moderator-dashboard-repository.interface';
import { DashboardRepository } from './dashboard.repository';
import { ModeratorDashboardRepository } from './moderator-dashboard.repository';
import { DashboardService } from './dashboard.service';
import { ModeratorDashboardService } from './moderator-dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ModeratorDashboardController } from './moderator-dashboard.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    { provide: MODERATOR_DASHBOARD_REPOSITORY, useClass: ModeratorDashboardRepository },
    DashboardService,
    ModeratorDashboardService,
  ],
  controllers: [DashboardController, ModeratorDashboardController],
})
export class DashboardModule {}
