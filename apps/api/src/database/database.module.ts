import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseProviders } from './database.providers';
import { getSequelizeModuleOptions } from './sequelize.config';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({ useFactory: getSequelizeModuleOptions }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders, SequelizeModule],
})
export class DatabaseModule {}
