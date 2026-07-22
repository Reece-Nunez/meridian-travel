'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import BlogPostForm from '@/components/admin/BlogPostForm';
import type { BlogPost } from '@/types/database';

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/blog/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error();
        setPost(await res.json());
      } catch {
        toast.error('Failed to load the post.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, id]);

  if (authLoading || (loading && !notFound)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin/blog" className="text-sm text-[#B8860B] hover:underline">
            ← Blog posts
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-[#8B4513]">Edit post</h1>
        </div>
        {notFound || !post ? (
          <p className="text-gray-600">That post could not be found.</p>
        ) : (
          <BlogPostForm mode="edit" initial={post} />
        )}
      </div>
    </div>
  );
}
