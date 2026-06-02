import type { Metadata } from 'next';
import Link from 'next/link';
import { SUPPORT_EMAIL_ADDRESS, SUPPORT_EMAIL_HREF, SUPPORT_WHATSAPP_HREF } from '@/lib/support-links';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help from the Quicklister team with listings, pricing, and platform access.',
};

function SupportCard({
  title,
  copy,
  href,
  actionLabel,
}: Readonly<{ title: string; copy: string; href: string; actionLabel: string }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        {actionLabel}
      </a>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div>
      <section className="bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Support
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              We’re here if you need a hand.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Whether you need help publishing a listing, choosing a package, or accessing your account,
              we’re ready to help.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <SupportCard
            title="Email support"
            copy={`Reach out with your question and email us directly at ${SUPPORT_EMAIL_ADDRESS}.`}
            href={SUPPORT_EMAIL_HREF}
            actionLabel="Open email"
          />
          <SupportCard
            title="Need Help?"
            copy="Open a WhatsApp chat with the team for quick platform guidance and account help."
            href={SUPPORT_WHATSAPP_HREF}
            actionLabel="Open WhatsApp"
          />
          <SupportCard
            title="Pricing and packages"
            copy="If you’re unsure which plan to choose, we can recommend the right one for your property."
            href="/pricing"
            actionLabel="View pricing"
          />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Need an answer now?</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Sign in to manage your listings, or create a new account to get started.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Free Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
