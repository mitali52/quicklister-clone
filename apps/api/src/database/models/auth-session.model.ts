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
  Index,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from './user.model';

export interface AuthSessionAttributes {
  id: string;
  userId: string;
  jti: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByJti: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthSessionCreationAttributes = Optional<
  AuthSessionAttributes,
  'id' | 'revokedAt' | 'replacedByJti' | 'createdAt' | 'updatedAt'
>;

@Table({
  tableName: 'auth_sessions',
  timestamps: true,
  underscored: true,
})
export class AuthSessionModel extends Model<
  AuthSessionAttributes,
  AuthSessionCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index
  @ForeignKey(() => UserModel)
  @Column({ field: 'user_id', type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @Index
  @Column(DataType.UUID)
  declare jti: string;

  @Index
  @Column({ field: 'family_id', type: DataType.UUID, allowNull: false })
  declare familyId: string;

  @Column({ field: 'token_hash', type: DataType.TEXT, allowNull: false })
  declare tokenHash: string;

  @Index
  @Column({ field: 'expires_at', type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ field: 'revoked_at', type: DataType.DATE })
  declare revokedAt: Date | null;

  @Column({ field: 'replaced_by_jti', type: DataType.UUID })
  declare replacedByJti: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;
}
