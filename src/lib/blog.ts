/**
 * Blog data access — public (published) reads for the /blog surface, sitemap,
 * and RSS feed. Admin CRUD lives in the /api/admin/blog routes (service role).
 *
 * Uses the shared `supabase` export, which resolves to the anon server client
 * during SSR. The "Published posts are publicly readable" RLS policy means we
 * only ever get status = 'published' rows through this path, but we filter
 * explicitly too so the intent is obvious and the queries stay index-friendly.
 */
import { supabase } from './supabase';
import type { BlogPost } from '@/types/database';

const LIST_FIELDS =
  'id, slug, title, excerpt, cover_image, cover_image_alt, category, tags, author, read_minutes, is_featured, published_at, updated_at';

/** All published posts, newest first. Used by the index, sitemap and RSS. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('getPublishedPosts error:', error.message);
    return [];
  }
  return (data as BlogPost[]) || [];
}

/** Lightweight list for cards (avoids shipping full post bodies to the index). */
export async function getPublishedPostSummaries(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(LIST_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('getPublishedPostSummaries error:', error.message);
    return [];
  }
  return (data as BlogPost[]) || [];
}

/** Single published post by slug, or null (404) if missing/draft. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error(`getPostBySlug(${slug}) error:`, error.message);
    return null;
  }
  return (data as BlogPost) || null;
}

/**
 * Up to `limit` other published posts, preferring ones sharing this post's
 * category, for the "keep reading" block. Excludes the current post.
 */
export async function getRelatedPosts(
  post: Pick<BlogPost, 'id' | 'category'>,
  limit = 3
): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(LIST_FIELDS)
    .eq('status', 'published')
    .neq('id', post.id)
    .order('category', { ascending: post.category ? true : false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRelatedPosts error:', error.message);
    return [];
  }
  return (data as BlogPost[]) || [];
}

/** Rough read-time estimate at ~200 wpm from HTML content. */
export function estimateReadMinutes(html: string | null | undefined): number {
  if (!html) return 1;
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
