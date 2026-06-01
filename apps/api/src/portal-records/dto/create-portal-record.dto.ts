import { IsIn, IsNumber, IsOptional, IsObject, IsString, MinLength } from 'class-validator';

export const PORTAL_RECORD_TYPES = [
  'tenancies',
  'offers',
  'tenant_references',
  'messages',
  'calendar_appointments',
  'valuations',
  'wallet_transactions',
  'addon_orders',
] as const;

export type PortalRecordType = (typeof PORTAL_RECORD_TYPES)[number];

export class CreatePortalRecordDto {
  @IsIn(PORTAL_RECORD_TYPES)
  recordType!: PortalRecordType;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
