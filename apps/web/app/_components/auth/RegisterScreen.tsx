import { CheckCircleIcon, StarIcon } from './AuthIcons';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { RegisterForm } from '@/app/(auth)/register/_components/RegisterForm';
import { RegisterAuthFooter } from './AuthFooter';

function GoogleReviewCard() {
  return (
    <div className="inline-flex items-center gap-3 rounded-lg bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.1)] ring-1 ring-slate-100">
      <div className="flex items-center gap-0.5 text-lg font-semibold">
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>
      <div className="flex items-center gap-0.5 text-amber-400" aria-label="4.5 out of 5 stars">
        <StarIcon className="h-4 w-4 fill-current stroke-current" />
        <StarIcon className="h-4 w-4 fill-current stroke-current" />
        <StarIcon className="h-4 w-4 fill-current stroke-current" />
        <StarIcon className="h-4 w-4 fill-current stroke-current" />
        <span className="text-lg leading-none">★</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">68 reviews</span>
      <span className="text-slate-400">›</span>
    </div>
  );
}

function ExposureLogos() {
  return (
    <div className="text-center">
      <p className="mb-5 text-sm font-semibold text-slate-600">Exposure on:</p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-2xl font-bold">
        <span className="text-violet-500">zoopla</span>
        <span className="text-slate-700">
          <span className="text-sky-500">P</span>rimeLocation
        </span>
        <span className="text-slate-800">
          rightmove <span className="text-emerald-400">⌂</span>
        </span>
        <span className="text-slate-800">
          <span className="inline-block translate-y-1 text-rose-500">⌖</span> OnTheMarket
        </span>
      </div>
    </div>
  );
}

function PlatformHighlights() {
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
    <aside className="rounded-2xl bg-slate-800 px-7 py-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
      <h2 className="text-2xl font-extrabold text-cyan-400">Platform highlights</h2>
      <ul className="mt-7 space-y-5">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-cyan-400" />
            <span className="text-lg font-semibold leading-8 text-white/95">{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function RegisterScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader theme="light" />

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-12 px-6 pb-10 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1.03fr)_minmax(360px,0.92fr)] lg:gap-16 lg:px-10 lg:pb-12">
        <section className="flex flex-col">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
            Sign Up
          </h1>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_24px_rgba(168,85,247,0.35)]">
            <div className="relative flex items-center overflow-hidden rounded-[15px] bg-gradient-to-r from-fuchsia-600 via-indigo-500 to-sky-400 px-6 py-6 text-white sm:px-7">
              <div className="absolute -left-2 top-10 h-16 w-16 rounded-full bg-white/15" />
              <div className="absolute right-6 top-0 h-24 w-24 rounded-full bg-white/10" />
              <div className="mr-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl">
                ✨
              </div>
              <div className="flex-1">
                <p className="text-2xl font-extrabold">No Credit Card Required</p>
                <p className="mt-1 text-base font-medium text-white/90">
                  No hidden fees - No commitment
                </p>
              </div>
              <div className="rounded-xl bg-white/20 px-5 py-3 text-sm font-extrabold uppercase tracking-wide">
                100% FREE
              </div>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-[1.7rem] font-bold leading-[1.45] tracking-tight text-slate-800">
            Register your details to access the QuicklisterPro platform and start creating your
            property ad!
          </p>

          <div className="mt-10 max-w-2xl">
            <RegisterForm />
          </div>
        </section>

        <section className="flex flex-col gap-10 lg:pt-9">
          <PlatformHighlights />

          <div className="flex flex-col items-center gap-6">
            <GoogleReviewCard />
            <ExposureLogos />
          </div>
        </section>
      </div>

      <RegisterAuthFooter />
    </div>
  );
}
