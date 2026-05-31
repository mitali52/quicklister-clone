import Link from 'next/link';
import { MarketingHeader } from '@/components/layout/MarketingHeader';

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9L12 3Z" />
    </svg>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="max-w-xl">
      <p className="text-sm font-semibold text-cyan-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600">{copy}</p>
    </div>
  );
}

function PortalRow() {
  const portals = ['Zoopla', 'rightmove', 'OnTheMarket', 'PrimeLocation', 'Property Redress'];

  return (
    <section className="bg-white px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-lg font-semibold text-slate-700">View our listings on</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5 sm:gap-x-10 lg:gap-x-14">
          {portals.map((portal) => (
            <span
              key={portal}
              className="text-lg font-extrabold tracking-tight text-slate-500 sm:text-xl"
            >
              {portal}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.35)] ring-1 ring-black/10">
        <div className="bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <div className="ml-3 h-3.5 w-24 rounded bg-slate-500/70" />
          </div>
        </div>
        <div className="grid h-[300px] grid-cols-[88px_1fr_108px] bg-white">
          <div className="bg-slate-800 p-3">
            <div className="mb-3 h-5 w-16 rounded bg-cyan-400" />
            <div className="space-y-2">
              {['Dashboard', 'Properties', 'Messages', 'Billing', 'Viewings'].map((item) => (
                <div key={item} className="h-3 rounded bg-slate-600/70" />
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              {['Sales Progression', 'Property Management', 'Enquiry Summary', 'Recent Actions'].map((card) => (
                <div key={card} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="h-2.5 w-24 rounded bg-slate-200" />
                  <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-500 p-3">
            <div className="rounded-xl bg-slate-900/85 p-3 text-white">
              <div className="h-2.5 w-16 rounded bg-slate-500" />
              <div className="mt-3 h-8 rounded-lg bg-slate-700" />
              <div className="mt-2 h-8 rounded-lg bg-fuchsia-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -left-4 rounded-xl bg-white px-3 py-2 text-sm shadow-[0_14px_28px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
        <div className="flex items-center gap-1 text-amber-400">
          <span className="font-semibold text-slate-700">Google</span>
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </div>
      </div>
    </div>
  );
}

function PlatformMockup() {
  return (
    <div className="relative rounded-2xl bg-white shadow-[0_22px_50px_rgba(15,23,42,0.16)] ring-1 ring-slate-100">
      <div className="grid min-h-[330px] grid-cols-[142px_1fr]">
        <div className="bg-slate-50 p-4">
          <div className="mb-4 h-7 w-28 rounded bg-indigo-600" />
          <div className="space-y-2">
            {['Overview', 'Properties', 'Messages', 'Reports', 'Billing'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <div className="h-3 flex-1 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="mb-4 h-5 w-44 rounded bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Property Features', 'Describe your property features, drag and drop your images and get ready for the enquiries!'],
              ['Price / Rent', 'Quickly update your property details and availability.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-slate-200 p-4">
                <div className="h-3 w-28 rounded bg-slate-800/30" />
                <div className="mt-3 h-24 rounded-lg bg-slate-100" />
                <p className="mt-3 text-xs leading-5 text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-xl bg-white px-5 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.16)] ring-1 ring-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Google</span>
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkBenefits() {
  const items = [
    'List and edit your property ad anytime, anywhere',
    'No hefty commission fees',
    'Get maximum exposure for your property',
    'Receive enquiries 24 hours a day, our platform is never closed',
    'Web chat with buyers or tenants',
    'Arrange viewings to suit you',
    'Expert sales and lettings support',
  ];

  return (
    <section className="relative overflow-hidden bg-slate-800 py-20 text-white">
      <div className="absolute inset-x-0 top-0 h-10 -skew-y-3 bg-slate-800" />
      <div className="absolute inset-x-0 bottom-0 h-10 skew-y-3 bg-slate-800" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div>
            <p className="text-sm font-semibold text-cyan-400">Why QuicklisterPro</p>
            <h2 className="mt-3 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
              The best marketing exposure at your fingertips, with expert support.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Access thousands of buyers or tenants in your area, and start booking viewings!
            </p>
          </div>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300 text-cyan-300">
                  <CheckIcon />
                </span>
                <span className="text-sm leading-7 text-slate-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="text-sm font-semibold text-cyan-400">Client Satisfaction</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="font-semibold text-slate-700">Google</span>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} />
                ))}
              </div>
              <span className="text-sm text-slate-500">68 reviews</span>
            </div>
            <p className="mt-8 text-7xl font-extrabold tracking-tight text-cyan-400">24hrs</p>
            <p className="mt-4 max-w-sm text-3xl font-bold leading-tight text-slate-800">
              Average time our customers have their listing live on Rightmove and Zoopla after submission.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              'A quick and easy solution to market your property.',
              'Fees very reasonable, marketing excellent, and house was sold within days of being on the market. Highly recommended.',
              'A refreshing change in the lettings market.',
            ].map((quote) => (
              <blockquote key={quote} className="rounded-lg bg-slate-50 px-6 py-6 text-lg font-semibold leading-8 text-slate-700">
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white px-6 pb-8 pt-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-6 text-xs text-slate-500">
              <Link href="/terms-and-conditions" className="hover:text-slate-800">
                Terms and conditions
              </Link>
              <Link href="/cookie-policy" className="hover:text-slate-800">
                Cookie policy
              </Link>
              <Link href="/privacy-policy" className="hover:text-slate-800">
                Privacy policy
              </Link>
            </div>
            <p className="text-xs text-slate-500">Copyright &copy; QuicklisterPro 2025</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span className="text-xl font-semibold text-slate-700">Property Redress</span>
            <span className="text-xl font-black text-indigo-500">stripe</span>
            <span className="text-xs">Secure payments partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SplitFeature({
  label,
  title,
  body,
  buttonLabel,
  buttonHref,
  imagePlacement = 'right',
}: {
  label: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  imagePlacement?: 'left' | 'right';
}) {
  const image = (
    <div className="relative">
      <div className="absolute -left-4 -top-4 h-20 w-20 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
      <div className="absolute right-6 top-5 h-32 w-28 rounded-[28px] bg-slate-800 shadow-xl" />
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-300 to-slate-100 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
        <div className="h-72 bg-gradient-to-br from-slate-200 via-white to-slate-300" />
      </div>
      <div className="absolute bottom-0 right-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
        <div className="h-2.5 w-24 rounded bg-slate-200" />
        <div className="mt-2 h-2.5 w-32 rounded bg-slate-100" />
      </div>
    </div>
  );

  const text = (
    <div>
      <p className="text-sm font-semibold text-cyan-400">{label}</p>
      <h3 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight text-slate-800">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{body}</p>
      <Link
        href={buttonHref}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        {buttonLabel}
        <ArrowIcon />
      </Link>
    </div>
  );

  return (
    <section className="overflow-hidden py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className={`grid items-center gap-14 lg:grid-cols-2 lg:gap-20 ${imagePlacement === 'left' ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {imagePlacement === 'left' ? image : text}
          {imagePlacement === 'left' ? text : image}
        </div>
      </div>
    </section>
  );
}

function ValuationStrip() {
  return (
    <section className="overflow-hidden bg-slate-100 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-fuchsia-500">Instant Valuation</p>
            <h3 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight text-slate-800">
              Need to check your property&apos;s value?
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Get an indicative value range in seconds using up to date market data.
            </p>
            <Link
              href="/valuation"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-400"
            >
              Get Instant Valuation
              <ArrowIcon />
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              <div className="h-72 bg-gradient-to-br from-amber-100 via-orange-50 to-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopHero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-8 pt-6 sm:px-8 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-r from-fuchsia-600 via-indigo-500 to-cyan-400 [clip-path:polygon(0_0,100%_0,100%_84%,0_100%)]" />
      <div className="relative mx-auto max-w-7xl">
        <MarketingHeader theme="hero" />

        <div className="grid items-start gap-10 pt-14 lg:grid-cols-2 lg:gap-14 lg:pt-16">
          <div className="max-w-2xl">
            <h1 className="max-w-xl text-5xl font-extrabold leading-[0.96] tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-[4.25rem]">
              Take control of your property marketing.
            </h1>
            <p className="mt-5 text-base font-medium text-white/90">No agents commission</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register?sell"
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-fuchsia-400"
              >
                I want to sell my property
              </Link>
              <Link
                href="/register?let"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500"
              >
                I want to let my property
              </Link>
            </div>
            <p className="mt-8 max-w-lg text-sm leading-7 text-slate-700">
              The Quicklister Pro platform lets you list your property on the major property sites
              from anywhere in the UK. Property experts are on hand to support your transaction
              from start to finish.
            </p>
          </div>
          <div className="relative pt-2">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeScreen() {
  return (
    <div className="bg-white">
      <TopHero />
      <PortalRow />
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)] lg:items-center">
            <PlatformMockup />
            <SectionHeader
              eyebrow="The Platform"
              title="Listing is easy!"
              copy="Describe your property features, drag and drop your property images and get ready for the enquiries!"
            />
          </div>
        </div>
      </section>

      <SplitFeature
        label="Let your Property"
        title="Find your next tenants without High Street fees."
        body="With Quicklister you can list your rental property, arrange viewings, and get credit and reference reports (additional charge applies)."
        buttonLabel="Get Started"
        buttonHref="/lettings"
      />

      <SplitFeature
        label="Sell your Property"
        title="Sell your property your way with Quicklister."
        body="Create your property ad, arrange viewings with interested buyers and let us instruct the solicitors once an offer has been agreed."
        buttonLabel="Get Started"
        buttonHref="/sales"
        imagePlacement="left"
      />

      <ValuationStrip />
      <DarkBenefits />
      <Testimonials />

      <section className="overflow-hidden bg-cyan-500 py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]">
            <div className="rounded-2xl bg-white/85 p-4 shadow-xl">
              <div className="h-56 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300" />
            </div>
            <div>
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
                Supercharge your property ad on the UK&apos;s biggest property websites.
              </h2>
              <p className="mt-4 text-sm font-semibold text-slate-800">Ready to get Started?</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/lettings" className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white">
                  Lettings <ArrowIcon />
                </Link>
                <Link href="/sales" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
                  Sales <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
