import { MetadataRoute } from 'next';
import { getAllProducts } from '@/data/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://svfreshmart.com';
  const products = getAllProducts(false);
  const categories = Array.from(new Set(products.map(p => p.category.toLowerCase())));

  const productEntries: MetadataRoute.Sitemap = products.map(product => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt || Date.now()),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
