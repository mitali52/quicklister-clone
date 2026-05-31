import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NOTIFICATIONS_REPOSITORY } from './interfaces/notifications-repository.interface';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { NotificationEventService } from './notifications-event.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: NOTIFICATIONS_REPOSITORY, useClass: NotificationsRepository },
    NotificationsService,
    NotificationEventService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationEventService],
})
export class NotificationsModule {}
