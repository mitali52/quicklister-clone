import type { Metadata } from 'next';
import { HeroSection } from './_components/HeroSection';
import { PortalLogosSection } from './_components/PortalLogosSection';
import { PlatformSection } from './_components/PlatformSection';
import { LettingsSalesSection } from './_components/LettingsSalesSection';
import { InstantValuationSection } from './_components/InstantValuationSection';
import { WhySection } from './_components/WhySection';
import { TestimonialsSection } from './_components/TestimonialsSection';
import { CtaSection } from './_components/CtaSection';

export const metadata: Metadata = {
  title: 'Quicklister — Take Control of Your Property Marketing',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PortalLogosSection />
      <PlatformSection />
      <LettingsSalesSection />
      <InstantValuationSection />
      <WhySection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
