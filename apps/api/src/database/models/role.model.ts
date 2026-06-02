import {
  Table,
  Model,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';
import { UserModel } from './user.model';

export interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoleCreationAttributes = Optional<
  RoleAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
})
export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];

  @BelongsToMany(() => PermissionModel, () => RolePermissionModel)
  declare permissions?: PermissionModel[];

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;
}
