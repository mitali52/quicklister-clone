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
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { RoleModel } from './role.model';
import { RolePermissionModel } from './role-permission.model';

export interface PermissionAttributes {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

@Table({
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
})
export class PermissionModel extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @BelongsToMany(() => RoleModel, () => RolePermissionModel)
  declare roles?: RoleModel[];

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;
}
