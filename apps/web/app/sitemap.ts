import type { MetadataRoute } from 'next';

const publicRoutes = [
  '/',
  '/the-platform',
  '/lettings',
  '/sales',
  '/commercial',
  '/pricing',
  '/support',
  '/valuation',
  '/login',
  '/register',
  '/forgot-password',
  '/terms-and-conditions',
  '/terms-of-use',
  '/privacy-policy',
  '/cookie-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quicklister.co.uk';

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
