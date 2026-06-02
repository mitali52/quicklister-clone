import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'Messages',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Subject', type: 'text', placeholder: 'Question about a viewing' },
  { name: 'senderName', label: 'Sender Name', type: 'text', placeholder: 'Jane Doe' },
  { name: 'body', label: 'Message', type: 'textarea', placeholder: 'Write your message...' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Unread', value: 'unread' },
      { label: 'Read', value: 'read' },
      { label: 'Archived', value: 'archived' },
    ],
  },
];

const columns: PortalColumnConfig[] = [
  { label: 'Subject', source: 'title' },
  { label: 'Sender', source: 'payload', payloadKey: 'senderName' },
  { label: 'Preview', source: 'payload', payloadKey: 'body', truncate: 60 },
  { label: 'Status', source: 'status' },
  { label: 'Received', source: 'createdAt', format: 'date' },
];

export default function MessagesPage() {
  return (
    <PortalCrudPage
      recordType="messages"
      title="Messages"
      subtitle="Review incoming enquiries and keep track of replies, labels, and message status."
      createLabel="Create Message"
      fields={fields}
      columns={columns}
      emptyTitle="When you receive a message, it will appear here."
      emptyCopy="Create a message entry for testing or keep this area as your inbox view."
    />
  );
}
