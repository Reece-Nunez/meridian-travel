import { getPublishedPostSummaries } from '@/lib/blog';

// Regenerate hourly alongside the blog pages.
export const revalidate = 3600;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxury.travel';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** GET /blog/rss.xml — RSS 2.0 feed of published posts. */
export async function GET() {
  const posts = await getPublishedPostSummaries();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : '';
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.excerpt || '')}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Meridian Luxury Travel — Expedition Guides</title>
    <link>${siteUrl}/blog</link>
    <description>Expert guides to planning Antarctica, Arctic, Galápagos and South America expeditions.</description>
    <language>en-us</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
