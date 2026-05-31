import type { Metadata } from 'next';
import { SettingsContent } from './_components/SettingsContent';

export const metadata: Metadata = {
  title: 'Settings | Quicklister',
};

export default function SettingsPage() {
  return <SettingsContent />;
}
