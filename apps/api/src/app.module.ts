import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, OrganizationsModule, ListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
