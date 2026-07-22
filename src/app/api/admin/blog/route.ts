import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-server';
import { estimateReadMinutes } from '@/lib/blog';

/** GET /api/admin/blog — list all posts (drafts included) for the admin table. */
export async function GET() {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(
      'id, slug, title, status, category, is_featured, published_at, updated_at, created_at'
    )
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Admin blog list error:', error.message);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

/** POST /api/admin/blog — create a new post. */
export async function POST(request: Request) {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const title = (body.title || '').trim();
  const slug = normalizeSlug(body.slug || body.title || '');

  if (!title || !slug) {
    return NextResponse.json(
      { error: 'Title and slug are required' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdmin();

  const status = body.status === 'published' ? 'published' : 'draft';
  const row = {
    title,
    slug,
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    cover_image: body.cover_image ?? null,
    cover_image_alt: body.cover_image_alt ?? null,
    category: (body.category || 'guides').trim(),
    tags: Array.isArray(body.tags) ? body.tags : [],
    related_destination: body.related_destination ?? null,
    author: (body.author || 'Meridian Luxury Travel').trim(),
    read_minutes: estimateReadMinutes(body.content),
    focus_keyword: body.focus_keyword ?? null,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    status,
    is_featured: !!body.is_featured,
    // Stamp published_at the first time a post goes live.
    published_at: status === 'published' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(row)
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (duplicate slug)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A post with that slug already exists' },
        { status: 409 }
      );
    }
    console.error('Admin blog create error:', error.message);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

/** lowercase, hyphenated, url-safe slug. */
function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
