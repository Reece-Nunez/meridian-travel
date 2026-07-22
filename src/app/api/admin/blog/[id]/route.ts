import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-server';
import { estimateReadMinutes } from '@/lib/blog';

/** GET /api/admin/blog/:id — full post for the editor (drafts included). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabaseAdmin = createSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

/** PATCH /api/admin/blog/:id — update a post. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabaseAdmin = createSupabaseAdmin();

  // Need the current row to know whether we're publishing for the first time.
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('blog_posts')
    .select('status, published_at')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  const setIf = (key: string, value: unknown) => {
    if (value !== undefined) updates[key] = value;
  };

  if (body.title !== undefined) updates.title = String(body.title).trim();
  if (body.slug !== undefined) updates.slug = normalizeSlug(body.slug);
  setIf('excerpt', body.excerpt);
  setIf('content', body.content);
  setIf('cover_image', body.cover_image);
  setIf('cover_image_alt', body.cover_image_alt);
  if (body.category !== undefined) updates.category = String(body.category).trim();
  if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
  setIf('related_destination', body.related_destination);
  if (body.author !== undefined) updates.author = String(body.author).trim();
  setIf('focus_keyword', body.focus_keyword);
  setIf('meta_title', body.meta_title);
  setIf('meta_description', body.meta_description);
  if (body.is_featured !== undefined) updates.is_featured = !!body.is_featured;
  if (body.content !== undefined) {
    updates.read_minutes = estimateReadMinutes(body.content);
  }

  if (body.status !== undefined) {
    const status = body.status === 'published' ? 'published' : 'draft';
    updates.status = status;
    // Stamp published_at the first time it goes live; keep the original date
    // on subsequent edits so canonical publish dates don't churn.
    if (status === 'published' && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A post with that slug already exists' },
        { status: 409 }
      );
    }
    console.error('Admin blog update error:', error.message);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** DELETE /api/admin/blog/:id */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdmin();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabaseAdmin = createSupabaseAdmin();
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id);

  if (error) {
    console.error('Admin blog delete error:', error.message);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
