import {
  Table,
  Model,
  Column,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { RoleModel } from './role.model';

export interface UserAttributes {
  id: string;
  roleId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  emailVerified: boolean;
  nrlaMember: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'phoneNumber'
  | 'avatarUrl'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'county'
  | 'postcode'
  | 'emailVerified'
  | 'nrlaMember'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index
  @ForeignKey(() => RoleModel)
  @Column({ field: 'role_id', type: DataType.UUID, allowNull: false })
  declare roleId: string;

  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;

  @Index
  @Column(DataType.TEXT)
  declare email: string;

  @Column({ field: 'password_hash', type: DataType.TEXT })
  declare passwordHash: string;

  @Column({ field: 'full_name', type: DataType.TEXT })
  declare fullName: string;

  @Column({ field: 'phone_number', type: DataType.TEXT })
  declare phoneNumber: string | null;

  @Column({ field: 'avatar_url', type: DataType.TEXT })
  declare avatarUrl: string | null;

  @Column({ field: 'address_line1', type: DataType.TEXT })
  declare addressLine1: string | null;

  @Column({ field: 'address_line2', type: DataType.TEXT })
  declare addressLine2: string | null;

  @Column(DataType.TEXT)
  declare city: string | null;

  @Column(DataType.TEXT)
  declare county: string | null;

  @Column(DataType.TEXT)
  declare postcode: string | null;

  @Column({
    field: 'email_verified',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare emailVerified: boolean;

  @Column({
    field: 'nrla_member',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare nrlaMember: boolean;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deletedAt: Date | null;
}
