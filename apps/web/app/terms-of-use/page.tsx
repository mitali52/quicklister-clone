import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/layout/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Quicklister',
  description:
    'Terms and conditions governing the use of Quicklister lettings and sales property marketing services.',
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: Readonly<SectionProps>) {
  return (
    <section>
      <h3 className="text-base font-semibold text-slate-800 mb-3">{title}</h3>
      {children}
    </section>
  );
}

export default function TermsOfUsePage() {
  return (
    <LegalPageShell title="Terms & Conditions">
      <div className="space-y-12 text-slate-700 leading-relaxed">

        {/* ── LETTINGS ─────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">
              Lettings Service
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Lettings Quicklister — Terms &amp; Conditions
            </h2>
          </div>

          <div className="space-y-8">

            <Section title="Services included">
              <ul className="space-y-2 ml-5 list-disc text-slate-600">
                <li>Property valuation guide</li>
                <li>Use of the Quicklister platform</li>
                <li>Quicklister remote support</li>
                <li>Comprehensive web portal marketing</li>
                <li>Notifications of tenant email and phone enquiries</li>
              </ul>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Owner consent">
              <p className="mb-3">
                By using our service you confirm you have authorisation from all legal owners and
                interested parties to market the property. If third-party consent is required (for
                example from a mortgage provider or freeholder), you must obtain it before listing.
                You also confirm authorisation to execute tenancy agreements on behalf of all
                interested parties.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Use of the Quicklister platform">
              <p className="mb-3">You must not:</p>
              <ul className="space-y-2 ml-5 list-disc text-slate-600 mb-4">
                <li>Distribute illegal, obscene, or harmful material</li>
                <li>Impersonate others or create false accounts or adverts</li>
                <li>Use software to harvest information from the platform</li>
                <li>
                  Share your password — you are responsible for all activity on your account
                </li>
              </ul>
              <p>
                The platform is designed for private landlords and must not be used for
                sub-letting or by estate agents. You must declare that you are the landlord or
                hold explicit permission from the landlord. Multiple adverts for the same
                property and dummy adverts are prohibited.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Marketing &amp; payment">
              <p className="mb-3">
                Full payment is required before marketing begins, processed via our secure payment
                gateway. Card details are never stored. Your listing will be published under
                Quicklister branding on your selected portals.
              </p>
              <p className="mb-3">
                The marketing period is <strong>6 weeks</strong> from the first day of live
                marketing, or until an offer has been accepted in principle — whichever comes
                first. You may pause or withdraw your listing at any time. Re-listing requires
                full fee payment.
              </p>
              <p className="mb-3">
                You are responsible for arranging all viewings. Quicklister reserves the right to
                suspend listings where landlords fail to respond to applicant enquiries.
              </p>
              <p className="text-sm bg-amber-50 text-amber-800 rounded-xl px-5 py-3">
                Quicklister will not refund marketing fees if a marketed property does not let or
                if the listing is withdrawn due to a breach of these terms.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="'Pro Lister' subscription">
              <p>
                Monthly subscriptions require a minimum 3-month commitment. Payments continue
                until you cancel. Non-payment within the 3-month period entitles Quicklister to
                pursue unpaid fees and remove your listings immediately.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Identification &amp; proof of ownership">
              <p>
                You must provide valid identification and proof of ownership. Acceptable documents
                include a passport, driving licence, mortgage statement, buildings insurance
                certificate, land registry document, solicitor&apos;s letter, or property deed.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Energy Performance Certificate (EPC)">
              <p>
                A valid EPC is required before your listing can go live. If you do not have one,
                Quicklister can arrange completion at the advertised cost.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Property details">
              <p className="mb-3">
                All property details must be a true and accurate representation of the property
                you are letting. Quicklister reviews marketing details before publication and
                reserves the right to request additional information or refuse photographs and
                descriptions that are inaccurate, inappropriate, or misleading.
              </p>
              <p className="text-sm bg-amber-50 text-amber-800 rounded-xl px-5 py-3">
                No refund will be issued for adverts that cannot be published due to inaccurate or
                non-compliant content.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Referencing">
              <p className="mb-3">
                Optional referencing and credit checks are available at advertised rates for
                applicants and guarantors. Checks are conducted by our partner Goodlord.
                Quicklister accepts no liability for costs or damages relating to an aborted
                tenancy or false information provided by a prospective tenant.
              </p>
              <p className="mb-3">
                If a tenant fails referencing and the tenancy does not proceed, new marketing
                credits must be purchased to re-start — unless the listing was paused during
                referencing (in which case it may be unpaused if the 6-week period remains valid).
              </p>
              <p>
                You must comply with Right to Rent legislation and verify compliant ID documents
                in person.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Risk &amp; liability">
              <p>
                Quicklister assumes no responsibility for tenant actions, tenancy breaches, or
                landlord–tenant disputes.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Rental and deposit payments">
              <p>
                Quicklister does not handle tenant payments. Rent goes directly to landlords. If
                Quicklister drafts a tenancy agreement on your behalf, your bank details will be
                required before execution.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="To Let boards">
              <p>
                Marketing boards are erected within 6 working days of order. Quicklister will
                arrange collection when requested. Quicklister accepts no liability for any damage
                caused by the erection or removal of marketing boards.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Sharing information">
              <p>
                Quicklister shares basic contact information (name, email, phone) with applicants
                who enquire about your property. Information may also be shared with third-party
                suppliers and sub-contractors who assist in service delivery.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Cancellations &amp; refunds">
              <p className="bg-red-50 text-red-800 rounded-xl px-5 py-3 text-sm">
                Quicklister will not refund or part-refund money for services already purchased
                once a property advert has been pushed live.
              </p>
            </Section>

          </div>
        </div>

        {/* Divider between sections */}
        <div className="border-t-4 border-slate-100 rounded-full" />

        {/* ── SALES ────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
              Sales Service
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Sales Quicklister — Terms &amp; Conditions
            </h2>
          </div>

          <div className="space-y-8">

            <Section title="Services included">
              <ul className="space-y-2 ml-5 list-disc text-slate-600">
                <li>Use of the Quicklister platform</li>
                <li>Online property valuation guide</li>
                <li>Quicklister remote support</li>
                <li>Comprehensive web portal marketing</li>
                <li>Notifications of buyer enquiries</li>
                <li>Solicitor instruction via memorandum of sale</li>
                <li>KYC (Know Your Customer) check on owner and purchaser</li>
              </ul>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Owner consent">
              <p>
                By using our service you confirm you have authorisation from all legal owners and
                interested parties to market and sell the property, and to accept purchaser offers
                and exchange contracts.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Marketing &amp; payment">
              <p className="mb-3">
                Full payment is required before marketing begins, processed via our secure payment
                gateway. Card details are never stored. Your listing will be published under
                Quicklister branding on your selected portals.
              </p>
              <p className="mb-3">
                The marketing period is <strong>3 months</strong> from the first day of marketing,
                or until you withdraw your listing — whichever comes first. You may pause or
                withdraw your listing at any time. Re-listing requires full fee payment.
              </p>
              <p className="mb-3">
                You are responsible for arranging all viewings with interested parties. Quicklister
                reserves the right to suspend listings where sellers fail to respond to enquiries.
              </p>
              <p className="text-sm bg-amber-50 text-amber-800 rounded-xl px-5 py-3">
                Quicklister will not refund marketing fees if a marketed property does not sell or
                if the listing is withdrawn due to a breach of these terms.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Identification &amp; proof of ownership">
              <p>
                You must provide valid identification and proof of ownership. Quicklister may
                conduct a KYC check using your ID to ensure compliance with Money Laundering
                Regulations.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Energy Performance Certificate (EPC)">
              <p>
                A valid EPC is required. If you do not have one, Quicklister can arrange
                completion at the advertised cost.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Property details">
              <p className="mb-3">
                All property details must be a true and accurate representation of the property
                you are selling. Quicklister reviews marketing details before publication and
                reserves the right to request additional information or refuse content that is
                inaccurate, inappropriate, or misleading.
              </p>
              <p className="text-sm bg-amber-50 text-amber-800 rounded-xl px-5 py-3">
                No refund will be issued for adverts that cannot be published due to non-compliant
                content.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Offers">
              <p>
                Upon a sale being agreed, Quicklister will — if requested — send memorandums of
                sale with the agreed price and party details to the relevant solicitors.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Additional services">
              <p>
                Third-party contractors may handle energy certificates, floorplans, conveyancing,
                mortgage advice, and marketing boards. Quicklister may receive referral commissions
                but accepts no liability for any grievance or complaint towards a third-party
                supplier.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="For Sale boards">
              <p>
                Marketing boards are erected within 6 working days of order. Quicklister will
                arrange collection when requested. Quicklister accepts no liability for any damage
                caused by the erection or removal of marketing boards.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Sharing information">
              <p>
                Basic contact information (name, email, phone) is shared with buyers who enquire
                about your property. Information may also be shared with third-party suppliers and
                sub-contractors who assist in service delivery.
              </p>
            </Section>

            <hr className="border-slate-100" />

            <Section title="Cancellations &amp; refunds">
              <p className="bg-red-50 text-red-800 rounded-xl px-5 py-3 text-sm">
                Quicklister will not refund or part-refund money for services already purchased
                once a property advert has been pushed live.
              </p>
            </Section>

          </div>
        </div>

        {/* ── GDPR (applies to both) ─────────────────────────── */}
        <div className="border-t-4 border-slate-100 rounded-full pt-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            General Data Protection Regulation (GDPR)
          </h2>
          <p>
            Quicklister processes personal data lawfully under Article 6 of the UK GDPR on the
            following grounds: your consent, performance of a contract, compliance with a legal
            obligation, or our legitimate interests — unless overridden by your data protection
            rights. For full details, please read our{' '}
            <a href="/privacy-policy" className="text-blue-700 hover:underline font-medium">
              Privacy Policy
            </a>
            .
          </p>
        </div>

      </div>
    </LegalPageShell>
  );
}
