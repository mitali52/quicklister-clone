import type { Metadata } from 'next';
import { SettingsContent } from './_components/SettingsContent';

export const metadata: Metadata = {
  title: 'My Account',
};

export default function SettingsPage() {
  return <SettingsContent />;
}
