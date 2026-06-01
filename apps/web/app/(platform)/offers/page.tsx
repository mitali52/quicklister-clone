import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'My Offers',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Property', type: 'text', placeholder: 'Apartment in Manchester' },
  { name: 'sellerName', label: 'Seller Name', type: 'text', placeholder: 'Mitali Patel' },
  { name: 'purchaserName', label: 'Purchaser Name', type: 'text', placeholder: 'John Smith' },
  { name: 'purchaserEmail', label: 'Purchaser Email', type: 'text', placeholder: 'john@example.com' },
  { name: 'purchaserPhone', label: 'Purchaser Phone', type: 'text', placeholder: '07700 900000' },
  { name: 'amount', label: 'Paid', type: 'number', placeholder: '0' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Accepted', value: 'accepted' },
      { label: 'Declined', value: 'declined' },
    ],
  },
];

const columns: PortalColumnConfig[] = [
  { label: 'Property', source: 'title' },
  { label: 'Seller Name', source: 'payload', payloadKey: 'sellerName' },
  { label: 'Purchaser Name', source: 'payload', payloadKey: 'purchaserName' },
  { label: 'Purchaser Email', source: 'payload', payloadKey: 'purchaserEmail' },
  { label: 'Purchaser Phone', source: 'payload', payloadKey: 'purchaserPhone' },
  { label: 'Created At', source: 'createdAt', format: 'date' },
  { label: 'Status', source: 'status' },
  { label: 'Paid', source: 'amount', format: 'currency' },
];

export default function OffersPage() {
  return (
    <PortalCrudPage
      recordType="offers"
      title="My Offers"
      subtitle="Track buyer interest, seller details, and offer status for every property."
      createLabel="Create Offer"
      fields={fields}
      columns={columns}
      emptyTitle="Record not found"
      emptyCopy="Add your first offer so you can monitor status, purchaser details, and payment."
    />
  );
}
