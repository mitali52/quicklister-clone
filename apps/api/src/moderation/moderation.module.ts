import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MODERATION_REPOSITORY } from './interfaces/moderation-repository.interface';
import { ModerationRepository } from './moderation.repository';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: MODERATION_REPOSITORY, useClass: ModerationRepository },
    ModerationService,
  ],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}
