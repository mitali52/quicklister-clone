import type { Metadata } from 'next';
import { AddOnsPage, type AddOnProduct } from '../_components/AddOnsPage';

export const metadata: Metadata = {
  title: 'Sales Add-ons',
};

const products: AddOnProduct[] = [
  { key: 'floorplan', name: 'Floorplan', description: 'Illustrate your property layout with a professional floorplan.', price: 119, tab: 'individual', accent: 'from-slate-100 via-slate-200 to-slate-300' },
  { key: 'for-sale-board', name: 'For Sale Board', description: 'Add a board to maximise local exposure and enquiries.', price: 79, tab: 'individual', accent: 'from-indigo-500 via-fuchsia-500 to-cyan-400' },
  { key: 'sales-progression', name: 'Sales Progression', description: 'Let us chase solicitors and keep the sale moving.', price: 199, tab: 'individual', accent: 'from-white to-slate-100' },
  { key: 'premium-photography', name: 'Premium Photography', description: 'Professional photography to improve presentation and engagement.', price: 149, tab: 'individual', accent: 'from-cyan-100 via-blue-100 to-slate-200' },
  { key: 'epc', name: 'Energy Performance Certificate', description: 'Arrange an EPC document when you do not already have a valid one.', price: 119, tab: 'individual', accent: 'from-emerald-100 via-yellow-100 to-red-100' },
  { key: 'property-video', name: 'Property Video', description: 'Professional video to showcase your property and attract interest.', price: 119, tab: 'individual', accent: 'from-slate-100 via-cyan-100 to-blue-200' },
  { key: 'rocket-auctions', name: 'Rocket Auctions', description: 'List your property by online auction and manage the sale process.', price: 0, tab: 'media', accent: 'from-purple-500 via-indigo-500 to-cyan-400', badge: 'Partner' },
  { key: 'conveyancer', name: 'Conveyancer Quotation', description: 'Request a conveyancing quote from our partner service.', price: 0, tab: 'media', accent: 'from-slate-300 via-slate-200 to-white', badge: 'Partner' },
  { key: 'buyers-survey', name: 'Home Buyers Survey', description: 'Obtain a survey quote through our trusted partner network.', price: 0, tab: 'media', accent: 'from-cyan-100 via-blue-100 to-indigo-100', badge: 'Partner' },
  { key: 'mortgage', name: 'Mortgage Advice', description: 'Speak to a mortgage specialist for guidance and support.', price: 0, tab: 'media', accent: 'from-slate-100 via-fuchsia-100 to-cyan-100', badge: 'Partner' },
];

export default function SalesAddOnsPage() {
  return (
    <AddOnsPage
      title="Choose add-ons"
      subtitle="Enhance your sales package with optional services and partner products."
      pageKey="sales"
      products={products}
      faqs={[
        'How long does it take before my ad appears on the property sites?',
        'How do I receive enquiries from the property portals?',
        'Do I need to do the viewings?',
        'How do I confirm a sale once a buyer has been found?',
        'Can Estate/Letting Agents advertise on Quicklister?',
        'Can I use my own solicitor?',
      ]}
      heroTone="purple"
    />
  );
}
