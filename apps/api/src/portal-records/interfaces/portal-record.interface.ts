import type { PortalRecordType } from '../dto/create-portal-record.dto';

export interface PortalRecord {
  id: string;
  userId: string;
  recordType: PortalRecordType;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
