import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/layout/SiteShell';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    default: 'Quicklister — List Your Property on Rightmove & Zoopla Without an Agent',
    template: '%s | Quicklister',
  },
  description:
    'Private sellers and landlords list directly on Rightmove, Zoopla, OnTheMarket and PrimeLocation. No estate agent fees. Simple one-off packages from £39.',
  metadataBase: new URL('https://quicklister.co.uk'),
  openGraph: {
    siteName: 'Quicklister',
    type: 'website',
    locale: 'en_GB',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <QueryProvider>
          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
