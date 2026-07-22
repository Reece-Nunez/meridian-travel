import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPostSummaries } from '@/lib/blog';
import PostCard from '@/components/blog/PostCard';
import BlogLeadCapture from '@/components/blog/BlogLeadCapture';

// Revalidate hourly so newly published posts appear without a redeploy.
export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxury.travel';

export const metadata: Metadata = {
  title: 'Expedition Travel Guides & Journal',
  description:
    'Expert guides to planning Antarctica, Arctic, Galápagos and South America expeditions — best times to go, real cost ranges, ships compared, and how to choose the right voyage.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: 'Expedition Travel Guides & Journal | Meridian Luxury Travel',
    description:
      'Expert guides to planning Antarctica, Arctic, Galápagos and South America expeditions.',
  },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPostSummaries();
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-100 bg-[#F5F5DC]/40">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <p className="text-sm uppercase tracking-[0.2em] text-[#B8860B]">
            The Meridian Journal
          </p>
          <h1
            className="mt-3 text-4xl text-[#8B4513] sm:text-5xl"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            Expedition Travel Guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Practical, no-hype guidance for planning the trip of a lifetime —
            Antarctica, the Arctic, the Galápagos and beyond.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <h2
              className="text-2xl text-[#8B4513]"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            >
              New guides are on the way
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-600">
              We&apos;re publishing in-depth expedition planning guides soon. In
              the meantime, tell us where you dream of going.
            </p>
            <Link
              href="/quote"
              className="mt-6 inline-block rounded-lg bg-[#B8860B] px-6 py-3 font-semibold text-white transition hover:bg-[#8B4513]"
            >
              Request a custom quote
            </Link>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group mb-14 grid overflow-hidden rounded-3xl border border-gray-200 bg-white transition hover:shadow-xl md:grid-cols-2"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#F5F5DC] md:aspect-auto">
                  {featured.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.cover_image}
                      alt={featured.cover_image_alt || featured.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] w-full items-center justify-center text-[#B8860B]/50">
                      <span style={{ fontFamily: 'var(--font-serif), serif' }}>
                        Meridian
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-[#B8860B]">
                    <span>Featured</span>
                    <span>· {featured.category}</span>
                  </div>
                  <h2
                    className="text-2xl text-[#8B4513] group-hover:underline sm:text-3xl"
                    style={{ fontFamily: 'var(--font-serif), serif' }}
                  >
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-3 text-gray-600">{featured.excerpt}</p>
                  )}
                  <span className="mt-5 font-semibold text-[#B8860B]">
                    Read the guide →
                  </span>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <div className="mt-16">
              <BlogLeadCapture />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
