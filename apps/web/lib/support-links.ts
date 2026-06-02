const SUPPORT_EMAIL = 'support@quicklister.co.uk';
const SUPPORT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? '447700900000';

export const SUPPORT_EMAIL_HREF = `mailto:${SUPPORT_EMAIL}`;
export const SUPPORT_EMAIL_ADDRESS = SUPPORT_EMAIL;
export const SUPPORT_WHATSAPP_HREF = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hi Quicklister support, I need help with my account.',
)}`;
