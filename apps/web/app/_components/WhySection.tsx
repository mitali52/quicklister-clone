const features = [
  'List and edit your property ad anytime, anywhere',
  'No hefty commission fees',
  'Get maximum exposure for your property',
  'Receive enquiries 24 hours a day, our platform is never closed',
  'Web chat with buyers or tenants',
  'Arrange viewings to suit you',
  'Expert sales and lettings support',
];

function TealCheck() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-cyan-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function WhySection() {
  return (
    <section
      className="bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-900 py-20 sm:py-24"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left — heading + intro */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Why QuicklisterPro
            </span>
            <h2
              id="why-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              The best marketing exposure at your fingertips, with expert support.
            </h2>
            <p className="mt-4 text-base leading-7 text-blue-200">
              Access thousands of buyers or tenants in your area, and start booking viewings!
            </p>
          </div>

          {/* Right — feature checklist */}
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <TealCheck />
                <span className="text-sm leading-6 text-blue-100">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
