import type { Metadata } from 'next';
import { ModerationQueueContent } from './_components/ModerationQueueContent';

export const metadata: Metadata = {
  title: 'Review Queue | Quicklister',
};

export default function ModerationPage() {
  return <ModerationQueueContent />;
}
