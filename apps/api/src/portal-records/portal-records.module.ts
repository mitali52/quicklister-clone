import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PortalRecordsController } from './portal-records.controller';
import { PortalRecordsService } from './portal-records.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PortalRecordsController],
  providers: [PortalRecordsService],
  exports: [PortalRecordsService],
})
export class PortalRecordsModule {}
