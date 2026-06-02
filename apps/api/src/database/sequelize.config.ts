import { SequelizeModuleOptions } from '@nestjs/sequelize';
import {
  AuthSessionModel,
  PermissionModel,
  RoleModel,
  RolePermissionModel,
  UserModel,
} from './models';
import { getDatabaseConfig } from './database.config';

export function getSequelizeModuleOptions(): SequelizeModuleOptions {
  const config = getDatabaseConfig();

  return {
    dialect: 'postgres',
    uri: config.url,
    models: [
      UserModel,
      RoleModel,
      PermissionModel,
      RolePermissionModel,
      AuthSessionModel,
    ],
    autoLoadModels: false,
    synchronize: false,
    logging: false,
    define: {
      underscored: true,
      freezeTableName: true,
    },
  };
}
