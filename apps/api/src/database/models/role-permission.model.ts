import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';

export interface RolePermissionAttributes {
  roleId: string;
  permissionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RolePermissionCreationAttributes = Optional<
  RolePermissionAttributes,
  'createdAt' | 'updatedAt'
>;

@Table({
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
})
export class RolePermissionModel extends Model<
  RolePermissionAttributes,
  RolePermissionCreationAttributes
> {
  @PrimaryKey
  @ForeignKey(() => RoleModel)
  @Column(DataType.UUID)
  declare roleId: string;

  @PrimaryKey
  @ForeignKey(() => PermissionModel)
  @Column(DataType.UUID)
  declare permissionId: string;

  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;

  @BelongsTo(() => PermissionModel)
  declare permission?: PermissionModel;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;
}
