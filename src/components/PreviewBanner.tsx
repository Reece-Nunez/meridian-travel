'use client';

import { useEffect, useState } from 'react';
import { isPreviewMode } from '@/lib/content';

export default function PreviewBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(isPreviewMode());
  }, []);

  if (!showBanner) return null;

  const exitPreview = () => {
    // Remove the preview parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    window.location.href = url.toString();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-orange-500 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-medium">Preview Mode</span>
          <span className="text-orange-100 text-sm">You are viewing unpublished draft content</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/content"
            className="text-sm bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded transition-colors"
          >
            Back to Editor
          </a>
          <button
            onClick={exitPreview}
            className="text-sm bg-white text-orange-600 hover:bg-orange-50 px-3 py-1 rounded transition-colors font-medium"
          >
            Exit Preview
          </button>
        </div>
      </div>
    </div>
  );
}
