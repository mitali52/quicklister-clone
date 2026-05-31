import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy | Quicklister',
  description:
    'How Quicklister (Cocoon UK Ltd) collects, uses, stores, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <div className="space-y-10 text-slate-700 leading-relaxed">

        {/* Intro */}
        <section>
          <p className="text-slate-600">
            This Privacy Notice is issued by Cocoon (UK) Ltd, trading as Quicklister, and explains
            how we collect, use, store, and protect your personal information.
          </p>
          <address className="mt-4 not-italic bg-slate-50 rounded-xl p-5 text-sm text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">Cocoon (UK) Ltd</p>
            <p>Unit 6, Albion House, High Street, Woking, GU21 6BG</p>
            <p>
              <a href="tel:02036672080" className="hover:text-blue-700">
                020 3667 2080
              </a>{' '}
              &mdash; Monday to Friday, 9am – 6pm
            </p>
            <p>
              <a href="mailto:support@quicklister.co.uk" className="hover:text-blue-700">
                support@quicklister.co.uk
              </a>
            </p>
            <p className="pt-1 text-slate-500">
              Proprietor: Edward Gray &mdash;{' '}
              <a href="mailto:edward@mycocoon.co.uk" className="hover:text-blue-700">
                edward@mycocoon.co.uk
              </a>
            </p>
          </address>
        </section>

        <hr className="border-slate-100" />

        {/* What information we hold */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            What type of information we hold
          </h2>
          <p className="mb-3">We may hold the following personal information about you:</p>
          <ul className="space-y-2 ml-5 list-disc text-slate-600">
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Home address</li>
            <li>
              Copy of photo ID (driving licence, passport, visa, or residence permit)
            </li>
            <li>
              Home ownership documents (land registry document, property deed, buildings
              insurance document, or mortgage statement)
            </li>
          </ul>
        </section>

        <hr className="border-slate-100" />

        {/* How we get it */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            How we get the information and why we have it
          </h2>
          <p>
            We obtain information voluntarily when you request property marketing services or an
            introduction to a property for sale or rent. We are required by money laundering
            regulations to carry out due diligence checks on sellers, purchasers, landlords, and
            tenants to validate their suitability before a transaction can be completed.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* What we do with it */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            What we do with the information
          </h2>
          <p className="mb-3">
            Your personal information is used to confirm property ownership and conduct
            transaction due diligence. This may include:
          </p>
          <ul className="space-y-2 ml-5 list-disc text-slate-600">
            <li>Credit check</li>
            <li>Previous landlord reference</li>
            <li>Employment check</li>
            <li>Affordability check</li>
            <li>Know Your Customer (KYC) check</li>
            <li>Property ownership or land registry check</li>
          </ul>
        </section>

        <hr className="border-slate-100" />

        {/* Storage */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            How we store your information
          </h2>
          <p className="mb-3">
            Your data is held on secure, password-protected CRM systems with end-to-end
            encryption on recognised cloud-based servers. We do not maintain any paper files.
          </p>
          <p>
            If there is no ongoing relationship between us, your personal information is
            retained for 12 months and then automatically deleted.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* Rights */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Your data protection rights
          </h2>

          <h3 className="text-base font-semibold text-slate-800 mb-2">
            Legal basis for processing
          </h3>
          <ul className="space-y-2 ml-5 list-disc text-slate-600 mb-6">
            <li>Your consent</li>
            <li>Performance of a contract with you</li>
            <li>Compliance with a legal obligation</li>
            <li>Our legitimate interests (where not overridden by your rights)</li>
          </ul>

          <h3 className="text-base font-semibold text-slate-800 mb-2">Your rights</h3>
          <ul className="space-y-2 ml-5 list-disc text-slate-600 mb-4">
            <li>Right of access — request a copy of the data we hold about you</li>
            <li>Right to rectification — request correction of inaccurate data</li>
            <li>Right to erasure — request deletion of your data</li>
            <li>Right to restriction of processing</li>
            <li>Right to object to processing</li>
            <li>Right to data portability</li>
          </ul>
          <p className="text-sm bg-blue-50 text-blue-800 rounded-xl px-5 py-3">
            You are not required to pay any charge for exercising your rights. We have one month
            to respond to any request you make.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* Complaints */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">How to complain</h2>
          <p className="mb-4">
            If you have a concern about how we handle your data, please contact our Data
            Controller in the first instance:
          </p>
          <address className="not-italic bg-slate-50 rounded-xl p-5 text-sm text-slate-600 space-y-0.5 mb-6">
            <p className="font-semibold text-slate-800">Edward Gray (Proprietor)</p>
            <p>
              <a href="mailto:edward@mycocoon.co.uk" className="hover:text-blue-700">
                edward@mycocoon.co.uk
              </a>
            </p>
            <p>Unit 6, Albion House, High Street, Woking, GU21 6BG</p>
          </address>
          <p className="mb-3">
            You may also raise a concern with the Information Commissioner&apos;s Office (ICO):
          </p>
          <address className="not-italic bg-slate-50 rounded-xl p-5 text-sm text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">Information Commissioner&apos;s Office</p>
            <p>Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
            <p>
              Helpline:{' '}
              <a href="tel:03031231113" className="hover:text-blue-700">
                0303 123 1113
              </a>
            </p>
          </address>
        </section>

      </div>
    </LegalPageShell>
  );
}
