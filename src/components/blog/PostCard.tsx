import Link from 'next/link';
import type { BlogPost } from '@/types/database';

export function formatPostDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Presentational card for the blog index / related-posts grid. */
export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-[#F5F5DC]">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.cover_image_alt || post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#B8860B]/50">
            <span style={{ fontFamily: 'var(--font-serif), serif' }}>Meridian</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[#B8860B]">
          <span>{post.category}</span>
          {post.read_minutes ? <span>· {post.read_minutes} min read</span> : null}
        </div>
        <h3
          className="text-lg text-[#8B4513] group-hover:underline"
          style={{ fontFamily: 'var(--font-serif), serif' }}
        >
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-4 text-xs text-gray-400">
          {formatPostDate(post.published_at)}
        </span>
      </div>
    </Link>
  );
}
