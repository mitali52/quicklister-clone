import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ListingsModule } from './listings/listings.module';
import { CategoriesModule } from './categories/categories.module';
import { ListingMediaModule } from './listing-media/listing-media.module';
import { ListingSearchModule } from './listing-search/listing-search.module';
import { ModerationModule } from './moderation/moderation.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RolesModule,
    UsersModule,
    OrganizationsModule,
    ListingsModule,
    CategoriesModule,
    ListingMediaModule,
    ListingSearchModule,
    ModerationModule,
    AdminModule,
    NotificationsModule,
    AuditLogModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
