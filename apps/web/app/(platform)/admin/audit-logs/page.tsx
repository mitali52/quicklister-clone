import type { Metadata } from 'next';
import { AdminAuditLogsContent } from './_components/AdminAuditLogsContent';

export const metadata: Metadata = {
  title: 'Audit Logs | Admin | Quicklister',
};

export default function AdminAuditLogsPage() {
  return <AdminAuditLogsContent />;
}
