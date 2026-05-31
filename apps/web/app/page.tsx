import type { Metadata } from 'next';
import { HomeScreen } from './_components/home/HomeScreen';

export const metadata: Metadata = {
  title: 'Quicklister - List Your Property on Rightmove & Zoopla Without an Agent',
};

export default function HomePage() {
  return <HomeScreen />;
}
