import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DASHBOARD_REPOSITORY } from './interfaces/dashboard-repository.interface';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    DashboardService,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
