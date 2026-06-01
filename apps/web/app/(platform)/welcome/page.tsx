import type { Metadata } from 'next';
import { WelcomeContent } from './_components/WelcomeContent';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Start your first property journey with Quicklister.',
};

export default function WelcomePage() {
  return <WelcomeContent />;
}
