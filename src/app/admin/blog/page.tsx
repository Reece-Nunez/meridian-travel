'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { formatPostDate } from '@/components/blog/PostCard';

interface PostRow {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  category: string;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string | null;
}

export default function AdminBlogList() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/blog');
        if (!res.ok) throw new Error();
        setPosts(await res.json());
      } catch {
        toast.error('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-[#B8860B] hover:underline">
              ← Admin
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-[#8B4513]">Blog posts</h1>
          </div>
          <Link
            href="/admin/blog/new"
            className="rounded-lg bg-[#B8860B] px-4 py-2 font-semibold text-white transition hover:bg-[#8B4513]"
          >
            + New post
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-600">No posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-block rounded-lg bg-[#B8860B] px-4 py-2 font-semibold text-white hover:bg-[#8B4513]"
            >
              Write your first guide
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog/${p.id}/edit`}
                        className="font-medium text-[#8B4513] hover:underline"
                      >
                        {p.title}
                      </Link>
                      {p.is_featured && (
                        <span className="ml-2 rounded bg-[#F5F5DC] px-1.5 py-0.5 text-xs text-[#B8860B]">
                          featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatPostDate(p.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
