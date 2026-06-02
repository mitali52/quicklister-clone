import type { Metadata } from 'next';
import { AddOnsPage, type AddOnProduct } from '../_components/AddOnsPage';

export const metadata: Metadata = {
  title: 'Lettings Add-ons',
};

const products: AddOnProduct[] = [
  { key: 'to-let-board', name: 'To Let Board', description: 'Advertise your property locally with a branded To Let board.', price: 79, tab: 'individual', accent: 'from-slate-100 via-slate-200 to-slate-300' },
  { key: 'lettings-photography', name: 'Premium Photography', description: 'Great photography helps attract more tenants to your listing.', price: 149, tab: 'individual', accent: 'from-cyan-100 via-blue-100 to-slate-200' },
  { key: 'tenancy-agreement', name: 'Tenancy Agreement & eSignatures', description: 'Draft and send contracts for review and electronic signature.', price: 99, tab: 'individual', accent: 'from-white to-slate-100' },
  { key: 'epc', name: 'Energy Performance Certificate', description: 'A valid EPC is required for most residential lettings.', price: 119, tab: 'individual', accent: 'from-emerald-100 via-yellow-100 to-red-100' },
  { key: 'property-video', name: 'Property Video', description: 'Showcase your property with a professional walkthrough video.', price: 119, tab: 'individual', accent: 'from-slate-100 via-cyan-100 to-blue-200' },
  { key: 'floorplan', name: 'Floorplan', description: 'Illustrate your property layout for tenant enquiries.', price: 119, tab: 'individual', accent: 'from-slate-100 via-slate-200 to-slate-300' },
  { key: 'referencing', name: 'Tenant Referencing', description: 'Request referencing support from our partner network.', price: 0, tab: 'media', accent: 'from-purple-500 via-indigo-500 to-cyan-400', badge: 'Partner' },
  { key: 'deposit', name: 'Deposit Protection', description: 'Support for handling deposits with peace of mind.', price: 0, tab: 'media', accent: 'from-slate-300 via-slate-200 to-white', badge: 'Partner' },
  { key: 'inventory', name: 'Inventory Check-in', description: 'Independent inventory and check-in support for landlords.', price: 0, tab: 'media', accent: 'from-cyan-100 via-blue-100 to-indigo-100', badge: 'Partner' },
  { key: 'insurance', name: 'Landlord Insurance', description: 'Find cover options for your property and rental portfolio.', price: 0, tab: 'media', accent: 'from-slate-100 via-fuchsia-100 to-cyan-100', badge: 'Partner' },
];

export default function LettingsAddOnsPage() {
  return (
    <AddOnsPage
      title="Choose add-ons"
      subtitle="Enhance your letting package with optional services and partner products."
      pageKey="lettings"
      products={products}
      faqs={[
        'How long does it take before my ad appears on the property sites?',
        'How do I receive enquiries from the property portals?',
        'Do I need to do the viewings?',
        'How do I reference a tenant?',
        'What happens if the references fail?',
        'Can Estate/Letting Agents advertise on Quicklister?',
      ]}
    />
  );
}
