import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'Tenant Reference',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Reference Name', type: 'text', placeholder: 'Tenant reference for 12 King Street' },
  { name: 'referenceNumber', label: 'Reference Number', type: 'text', placeholder: 'REF-001' },
  { name: 'tenantName', label: 'Tenant Name', type: 'text', placeholder: 'John Smith' },
  { name: 'propertyPostcode', label: 'Property Postcode', type: 'text', placeholder: 'SW1A 1AA' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Complete', value: 'complete' },
      { label: 'Failed', value: 'failed' },
    ],
  },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add supporting details...' },
];

const columns: PortalColumnConfig[] = [
  { label: 'Reference', source: 'title' },
  { label: 'Reference No.', source: 'payload', payloadKey: 'referenceNumber' },
  { label: 'Tenant Name', source: 'payload', payloadKey: 'tenantName' },
  { label: 'Postcode', source: 'payload', payloadKey: 'propertyPostcode' },
  { label: 'Status', source: 'status' },
  { label: 'Created', source: 'createdAt', format: 'date' },
];

export default function TenantReferencesPage() {
  return (
    <PortalCrudPage
      recordType="tenant_references"
      title="Tenant Reference"
      subtitle="Keep track of references, reference numbers, and support notes in one place."
      createLabel="Add a Reference"
      fields={fields}
      columns={columns}
      emptyTitle="You currently have no activity or historic references"
      emptyCopy="Add a reference to track tenant checks and supporting notes."
    />
  );
}
