import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/account/*',
        '/admin',
        '/admin/*',
        '/api/*',
        '/checkout'
      ],
    },
    sitemap: 'https://svfreshmart.com/sitemap.xml',
  };
}
