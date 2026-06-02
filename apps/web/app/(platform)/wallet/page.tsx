import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'Quicklister Wallet',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Transaction', type: 'text', placeholder: 'Wallet top up' },
  { name: 'amount', label: 'Amount', type: 'number', placeholder: '50' },
  {
    name: 'status',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Credit', value: 'credit' },
      { label: 'Debit', value: 'debit' },
    ],
  },
  { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Add a memo...' },
];

const columns: PortalColumnConfig[] = [
  { label: 'Transaction', source: 'title' },
  { label: 'Type', source: 'status' },
  { label: 'Amount', source: 'amount', format: 'currency', signed: true },
  { label: 'Created', source: 'createdAt', format: 'date' },
];

export default function WalletPage() {
  return (
    <PortalCrudPage
      recordType="wallet_transactions"
      title="Quicklister Wallet"
      subtitle="Track wallet credits, debits, and payment history."
      createLabel="Add Credit"
      fields={fields}
      columns={columns}
      emptyTitle="No wallet activity yet"
      emptyCopy="Add a credit or debit entry to track wallet movement."
      summaryType="wallet"
    />
  );
}
