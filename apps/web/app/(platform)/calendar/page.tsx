import type { Metadata } from 'next';
import { PortalCrudPage, type PortalColumnConfig, type PortalFieldConfig } from '../_components/PortalCrudPage';

export const metadata: Metadata = {
  title: 'Calendar',
};

const fields: PortalFieldConfig[] = [
  { name: 'title', label: 'Appointment', type: 'text', placeholder: 'Viewing at 15 High Street' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'time', label: 'Time', type: 'text', placeholder: '10:30 AM' },
  {
    name: 'status',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Viewing', value: 'viewing' },
      { label: 'Call', value: 'call' },
      { label: 'Meeting', value: 'meeting' },
    ],
  },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add any notes...' },
];

const columns: PortalColumnConfig[] = [
  { label: 'Appointment', source: 'title' },
  { label: 'Date', source: 'payload', payloadKey: 'date', format: 'date' },
  { label: 'Time', source: 'payload', payloadKey: 'time' },
  { label: 'Type', source: 'status' },
];

export default function CalendarPage() {
  return (
    <PortalCrudPage
      recordType="calendar_appointments"
      title="Calendar"
      subtitle="Plan appointments, viewings, and calls in a simple calendar-backed list."
      createLabel="Add Appointment"
      fields={fields}
      columns={columns}
      emptyTitle="Your calendar is empty"
      emptyCopy="Add an appointment to start tracking your viewings and follow-ups."
    />
  );
}
