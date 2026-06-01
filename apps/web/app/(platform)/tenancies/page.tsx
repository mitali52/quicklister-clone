import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'My Tenancies',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Property', type: 'text', placeholder: '2 bed flat, London' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'rentAmount', label: 'Rent Amount', type: 'number', placeholder: '1450' },
  { name: 'depositAmount', label: 'Deposit Amount', type: 'number', placeholder: '1500' },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: '12 months' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
    ],
  },
];

const columns: PortalColumnConfig[] = [
  { label: 'Property', source: 'title' },
  { label: 'Start Date', source: 'payload', payloadKey: 'startDate', format: 'date' },
  { label: 'Rent Amount', source: 'payload', payloadKey: 'rentAmount', format: 'currency' },
  { label: 'Deposit Amount', source: 'payload', payloadKey: 'depositAmount', format: 'currency' },
  { label: 'Duration', source: 'payload', payloadKey: 'duration' },
];

export default function TenanciesPage() {
  return (
    <PortalCrudPage
      recordType="tenancies"
      title="My Tenancies"
      subtitle="Track tenancy records, rent, deposits, and duration from one place."
      createLabel="Create Tenancy"
      fields={fields}
      columns={columns}
      emptyTitle="Record not found"
      emptyCopy="Create your first tenancy to keep a clear record of rent, deposit, and start dates."
    />
  );
}
