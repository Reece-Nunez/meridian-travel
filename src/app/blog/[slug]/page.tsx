import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from '@/lib/blog';
import PostCard, { formatPostDate } from '@/components/blog/PostCard';
import BlogLeadCapture from '@/components/blog/BlogLeadCapture';

export const revalidate = 3600;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxury.travel';

// Pre-render published posts at build; ISR keeps them fresh.
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Guide not found' };
  }

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
      authors: [post.author],
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const url = `${siteUrl}/blog/${post.slug}`;

  // Article structured data — helps Google understand + can earn rich results.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Meridian Luxury Travel',
      '@id': `${siteUrl}/#organization`,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: post.category,
    keywords: post.tags?.length ? post.tags.join(', ') : post.focus_keyword || undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <article className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:pt-14">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/blog" className="text-[#B8860B] hover:underline">
            ← All guides
          </Link>
        </nav>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[#B8860B]">
          <span>{post.category}</span>
          {post.read_minutes ? <span>· {post.read_minutes} min read</span> : null}
          {post.published_at ? (
            <span>· {formatPostDate(post.published_at)}</span>
          ) : null}
        </div>

        <h1
          className="text-3xl text-[#8B4513] sm:text-4xl"
          style={{ fontFamily: 'var(--font-serif), serif', lineHeight: 1.2 }}
        >
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>
        )}

        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-[#F5F5DC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.cover_image_alt || post.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="article-body mt-10"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Lead magnet */}
        <BlogLeadCapture />

        {/* Primary conversion CTA */}
        <section className="mt-6 rounded-2xl bg-[#8B4513] p-8 text-center text-[#F5F5DC]">
          <h2
            className="text-2xl"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            Ready to plan your expedition?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[#F5F5DC]/90">
            Tell us what you have in mind and we&apos;ll craft a tailored,
            no-obligation itinerary and quote.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/quote"
              className="rounded-lg bg-[#DAA520] px-6 py-3 font-semibold text-[#8B4513] transition hover:bg-[#F5F5DC]"
            >
              Request a custom quote
            </Link>
            {post.related_destination && (
              <Link
                href={`/destinations/${post.related_destination}`}
                className="rounded-lg border border-[#F5F5DC]/60 px-6 py-3 font-semibold text-[#F5F5DC] transition hover:bg-[#F5F5DC]/10"
              >
                Explore {post.related_destination}
              </Link>
            )}
          </div>
        </section>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-[#F5F5DC]/30">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2
              className="mb-8 text-2xl text-[#8B4513]"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            >
              Keep reading
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
