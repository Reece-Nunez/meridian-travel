import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxurytravel.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cruises`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Destination pages
  const destinations = [
    'peru',
    'argentina',
    'brazil',
    'chile',
    'ecuador',
    'galapagos',
    'antarctica',
    'arctic',
  ];

  const destinationPages: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${baseUrl}/destinations/${dest}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic pages from database
  let packagePages: MetadataRoute.Sitemap = [];
  let shipPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    // Fetch active packages
    const { data: packages } = await supabase
      .from('trip_packages')
      .select('id, updated_at')
      .eq('is_active', true);

    if (packages) {
      packagePages = packages.map((pkg) => ({
        url: `${baseUrl}/packages/${pkg.id}`,
        lastModified: pkg.updated_at ? new Date(pkg.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

    // Fetch ships
    const { data: ships } = await supabase
      .from('ships')
      .select('id, updated_at')
      .eq('is_active', true);

    if (ships) {
      shipPages = ships.map((ship) => ({
        url: `${baseUrl}/ships/${ship.id}`,
        lastModified: ship.updated_at ? new Date(ship.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published');

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : post.published_at
            ? new Date(post.published_at)
            : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [
    ...staticPages,
    ...destinationPages,
    ...packagePages,
    ...shipPages,
    ...blogPages,
  ];
}
