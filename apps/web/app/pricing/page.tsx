import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for letting and selling property.',
};

function PricingCard({
  name,
  price,
  details,
  features,
}: Readonly<{ name: string; price: string; details: string; features: string[] }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">{name}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{price}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{details}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div>
      <section className="bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Pricing
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Straightforward pricing with no hidden commission.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Choose the package that fits your property journey and keep full control of the process.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <PricingCard
            name="Lettings"
            price="From £39"
            details="Ideal for landlords who want a simple way to advertise a rental property."
            features={[
              'Publish to major portals',
              'Manage enquiries in one place',
              'Direct owner workflow',
            ]}
          />
          <PricingCard
            name="Sales"
            price="From £99"
            details="For private sellers who want more control and better value than a traditional agent."
            features={[
              'Create your listing quickly',
              'Track leads and viewings',
              'Keep the process moving online',
            ]}
          />
          <PricingCard
            name="Commercial"
            price="Custom"
            details="Talk to us for a package aligned to your commercial listing goals and property type."
            features={[
              'Flexible listing options',
              'Support from property specialists',
              'Tailored to your asset class',
            ]}
          />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Need help choosing?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Our team can help you choose the right route for your property and your budget.
          </p>
          <Link
            href="/support"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
