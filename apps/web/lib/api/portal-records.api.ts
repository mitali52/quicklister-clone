import { apiDelete, apiGet, apiPatch, apiPost } from './client';

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

export interface PortalRecord {
  id: string;
  userId: string;
  recordType: PortalRecordType;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PortalRecordInput {
  recordType: PortalRecordType;
  title: string;
  status?: string;
  amount?: number | null;
  currency?: string;
  payload?: Record<string, unknown>;
}

export const listPortalRecordsApi = (recordType: PortalRecordType): Promise<PortalRecord[]> =>
  apiGet<PortalRecord[]>(`/portal-records?type=${encodeURIComponent(recordType)}`);

export const createPortalRecordApi = (data: PortalRecordInput): Promise<PortalRecord> =>
  apiPost<PortalRecord>('/portal-records', data);

export const updatePortalRecordApi = (
  id: string,
  data: Partial<PortalRecordInput>,
): Promise<PortalRecord> => apiPatch<PortalRecord>(`/portal-records/${id}`, data);

export const deletePortalRecordApi = (id: string): Promise<void> => apiDelete<void>(`/portal-records/${id}`);
