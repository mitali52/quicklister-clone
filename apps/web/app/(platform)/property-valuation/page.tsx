import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'Property Valuation Tool',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Property', type: 'text', placeholder: '21 Market Street' },
  { name: 'postcode', label: 'Find by Postcode/Zip', type: 'text', placeholder: 'Enter a postcode' },
  {
    name: 'status',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Sales', value: 'sales' },
      { label: 'Lettings', value: 'lettings' },
    ],
  },
  { name: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'Flat' },
  { name: 'bedrooms', label: 'Number of Bedrooms', type: 'number', placeholder: '2' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add any details...' },
];

const columns: PortalColumnConfig[] = [
  { label: 'Property', source: 'title' },
  { label: 'Postcode', source: 'payload', payloadKey: 'postcode' },
  { label: 'Type', source: 'status' },
  { label: 'Bedrooms', source: 'payload', payloadKey: 'bedrooms' },
  { label: 'Estimated Value', source: 'amount', format: 'currency' },
  { label: 'Created', source: 'createdAt', format: 'date' },
];

export default function PropertyValuationPage() {
  return (
    <PortalCrudPage
      recordType="valuations"
      title="Property Valuation Tool"
      subtitle="Capture valuation requests with postcode, type, and bedroom count for a quick market estimate."
      createLabel="Get my Valuation"
      fields={fields}
      columns={columns}
      emptyTitle="No valuation requests yet"
      emptyCopy="Use the form above to create a valuation request and track the estimate history."
      summaryType="valuation"
    />
  );
}
