'use client';

import Link from 'next/link';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import BlogPostForm from '@/components/admin/BlogPostForm';

export default function NewBlogPostPage() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();

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
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin/blog" className="text-sm text-[#B8860B] hover:underline">
            ← Blog posts
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-[#8B4513]">New post</h1>
        </div>
        <BlogPostForm mode="create" />
      </div>
    </div>
  );
}
