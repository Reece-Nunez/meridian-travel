'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';
import type { BlogPost } from '@/types/database';

const DESTINATIONS = [
  'antarctica',
  'arctic',
  'galapagos',
  'peru',
  'argentina',
  'brazil',
  'chile',
  'ecuador',
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type Mode = 'create' | 'edit';

/**
 * Shared create/edit form for blog posts. Talks to /api/admin/blog
 * (create) and /api/admin/blog/:id (update/delete). Includes a live SEO
 * helper so Chris gets feedback on title/meta length and keyword usage.
 */
export default function BlogPostForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: BlogPost;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    cover_image: initial?.cover_image || '',
    cover_image_alt: initial?.cover_image_alt || '',
    category: initial?.category || 'guides',
    tags: (initial?.tags || []).join(', '),
    related_destination: initial?.related_destination || '',
    author: initial?.author || 'Meridian Luxury Travel',
    focus_keyword: initial?.focus_keyword || '',
    meta_title: initial?.meta_title || '',
    meta_description: initial?.meta_description || '',
    is_featured: initial?.is_featured || false,
    status: (initial?.status || 'draft') as 'draft' | 'published',
  });

  const update = (patch: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...patch }));

  // Auto-derive slug from title until the user edits the slug directly.
  const onTitleChange = (title: string) => {
    update({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
  };

  const seo = useMemo(() => {
    const metaTitle = form.meta_title || form.title;
    const metaDesc = form.meta_description || form.excerpt;
    const kw = form.focus_keyword.trim().toLowerCase();
    const inTitle = kw ? form.title.toLowerCase().includes(kw) : null;
    const inContent = kw
      ? form.content.toLowerCase().includes(kw)
      : null;
    return {
      titleLen: metaTitle.length,
      descLen: metaDesc.length,
      inTitle,
      inContent,
    };
  }, [form]);

  async function save(nextStatus?: 'draft' | 'published') {
    const status = nextStatus ?? form.status;
    if (!form.title.trim()) {
      toast.error('Give the post a title first.');
      return;
    }
    const slug = slugify(form.slug || form.title);
    if (!slug) {
      toast.error('Could not build a valid slug — check the title.');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      slug,
      status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      related_destination: form.related_destination || null,
    };

    try {
      const url =
        mode === 'create'
          ? '/api/admin/blog'
          : `/api/admin/blog/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      update({ status });
      toast.success(
        status === 'published' ? 'Post published.' : 'Draft saved.'
      );
      if (mode === 'create') {
        router.push(`/admin/blog/${data.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (mode !== 'edit' || !initial) return;
    // Inline toast confirmation (project rule: no window.confirm).
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Delete “{initial.title}”? This can&apos;t be undone.</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                void doDelete();
              }}
              className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="rounded bg-gray-200 px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  }

  async function doDelete() {
    if (!initial) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${initial.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Post deleted.');
      router.push('/admin/blog');
    } catch {
      toast.error('Could not delete the post.');
      setDeleting(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#B8860B] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const lenColor = (len: number, min: number, max: number) =>
    len === 0 ? 'text-gray-400' : len < min || len > max ? 'text-amber-600' : 'text-green-600';

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Title</label>
          <input
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Best Time to Visit Antarctica"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/blog/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update({ slug: e.target.value });
              }}
              onBlur={(e) => update({ slug: slugify(e.target.value) })}
              placeholder="best-time-to-visit-antarctica"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Excerpt / summary</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            rows={2}
            placeholder="One or two sentences shown on cards and used as the meta description fallback."
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Content</label>
          <RichTextEditor
            value={form.content}
            onChange={(content) => update({ content })}
            placeholder="Write the guide…"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publish box */}
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Status</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                form.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {form.status}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => save('draft')}
              disabled={saving}
              className="rounded-lg border border-[#B8860B] px-4 py-2 text-sm font-semibold text-[#B8860B] transition hover:bg-[#F5F5DC] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              onClick={() => save('published')}
              disabled={saving}
              className="rounded-lg bg-[#B8860B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B4513] disabled:opacity-60"
            >
              {form.status === 'published' ? 'Update' : 'Publish'}
            </button>
            {mode === 'edit' && (
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="mt-1 text-xs text-red-600 hover:underline disabled:opacity-60"
              >
                Delete post
              </button>
            )}
          </div>
        </div>

        {/* SEO helper */}
        <div className="rounded-xl border border-gray-200 p-4">
          <span className="text-sm font-semibold text-gray-700">SEO</span>
          <div className="mt-3 space-y-3">
            <div>
              <label className={labelCls}>Focus keyword</label>
              <input
                value={form.focus_keyword}
                onChange={(e) => update({ focus_keyword: e.target.value })}
                placeholder="best time to visit antarctica"
                className={inputCls}
              />
              {form.focus_keyword && (
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li className={seo.inTitle ? 'text-green-600' : 'text-amber-600'}>
                    {seo.inTitle ? '✓' : '•'} keyword in title
                  </li>
                  <li className={seo.inContent ? 'text-green-600' : 'text-amber-600'}>
                    {seo.inContent ? '✓' : '•'} keyword in content
                  </li>
                </ul>
              )}
            </div>
            <div>
              <label className={labelCls}>Meta title</label>
              <input
                value={form.meta_title}
                onChange={(e) => update({ meta_title: e.target.value })}
                placeholder="Falls back to the post title"
                className={inputCls}
              />
              <span className={`text-xs ${lenColor(seo.titleLen, 30, 60)}`}>
                {seo.titleLen} chars (aim 30–60)
              </span>
            </div>
            <div>
              <label className={labelCls}>Meta description</label>
              <textarea
                value={form.meta_description}
                onChange={(e) => update({ meta_description: e.target.value })}
                rows={3}
                placeholder="Falls back to the excerpt"
                className={inputCls}
              />
              <span className={`text-xs ${lenColor(seo.descLen, 70, 160)}`}>
                {seo.descLen} chars (aim 70–160)
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <span className="text-sm font-semibold text-gray-700">Details</span>
          <div>
            <label className={labelCls}>Cover image URL</label>
            <input
              value={form.cover_image}
              onChange={(e) => update({ cover_image: e.target.value })}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Cover image alt text</label>
            <input
              value={form.cover_image_alt}
              onChange={(e) => update({ cover_image_alt: e.target.value })}
              placeholder="Describe the image"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input
              value={form.category}
              onChange={(e) => update({ category: e.target.value })}
              placeholder="guides"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => update({ tags: e.target.value })}
              placeholder="antarctica, planning"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Related destination</label>
            <select
              value={form.related_destination}
              onChange={(e) => update({ related_destination: e.target.value })}
              className={inputCls}
            >
              <option value="">None</option>
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => update({ is_featured: e.target.checked })}
            />
            Feature at top of blog
          </label>
        </div>

        {form.status === 'published' && initial?.slug && (
          <Link
            href={`/blog/${initial.slug}`}
            target="_blank"
            className="block text-center text-sm text-[#B8860B] hover:underline"
          >
            View live post ↗
          </Link>
        )}
      </div>
    </div>
  );
}
