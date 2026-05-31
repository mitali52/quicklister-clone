import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Cookie Policy | Quicklister',
  description:
    'How Quicklister uses cookies and other tracking technologies on its websites.',
};

const cookieTypes: Array<{ name: string; description: string }> = [
  {
    name: 'Advertising cookies',
    description:
      'Placed by advertisers and ad servers to display relevant advertisements and track ad performance across websites you visit.',
  },
  {
    name: 'Analytics cookies',
    description:
      'Monitor how users reach our site and interact with it, so we can identify what features work well and what needs improvement.',
  },
  {
    name: 'Our cookies',
    description:
      'First-party cookies (permanent or temporary) that are necessary for the site to function correctly. Some can be disabled in your browser settings.',
  },
  {
    name: 'Personalisation cookies',
    description:
      'Recognise repeat visitors and record browsing history, pages visited, and user preferences to tailor your experience.',
  },
  {
    name: 'Security cookies',
    description:
      'Help identify and prevent security risks by authenticating users and protecting your data.',
  },
  {
    name: 'Site management cookies',
    description:
      'Maintain your session so you are not unexpectedly logged out and retain information you have entered across pages.',
  },
  {
    name: 'Third-party cookies',
    description:
      'Placed by third-party service providers to gather and track information. These can be manually disabled in your browser.',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageShell title="Cookie Policy" lastUpdated="28 September 2021">
      <div className="space-y-10 text-slate-700 leading-relaxed">

        {/* Intro */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Introduction</h2>
          <p className="mb-3">
            Cocoon (UK) Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), trading as
            Quicklister, uses cookies, web beacons, tracking pixels, and other tracking
            technologies on the following websites:
          </p>
          <ul className="space-y-1.5 ml-5 list-disc text-slate-600 mb-4">
            <li>www.quicklister.co.uk</li>
            <li>www.mycocoon.co.uk</li>
            <li>www.qlp.mycocoon.co.uk</li>
          </ul>
          <p>
            We use these technologies to customise the site and improve your experience. We
            reserve the right to modify this policy at any time, with changes taking effect
            immediately upon posting.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* What is a cookie */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">What is a cookie?</h2>
          <p>
            A cookie is a small string of information stored on your device that assigns you a
            unique identifier. Our sites use cookies to track the services you use, record
            registration information, maintain your preferences, keep you logged in, facilitate
            purchases, and monitor page visits.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* Types */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Types of cookies we use</h2>
          <div className="space-y-4">
            {cookieTypes.map((cookie) => (
              <div
                key={cookie.name}
                className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4"
              >
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{cookie.name}</h3>
                <p className="text-sm text-slate-600">{cookie.description}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Control */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            How to control cookies
          </h2>
          <p className="mb-3">
            Most browsers accept cookies automatically. You can remove or reject cookies through
            your browser or device settings at any time. Please note that doing so may affect the
            functionality of our websites.
          </p>
          <p className="text-sm text-slate-500">
            Refer to your browser&apos;s help documentation for instructions on managing cookies.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* Other technologies */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Other tracking technologies
          </h2>
          <p>
            We may also use web beacons and pixel tags to count visitor numbers and gather
            statistical data. These cannot be directly declined, but their impact can be limited
            by adjusting your cookie settings as described above.
          </p>
        </section>

        <hr className="border-slate-100" />

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies, please get in touch:
          </p>
          <address className="not-italic bg-slate-50 rounded-xl p-5 text-sm text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">Cocoon (UK) Ltd</p>
            <p>16–18 High Street, Kingston upon Thames</p>
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
          </address>
        </section>

      </div>
    </LegalPageShell>
  );
}
