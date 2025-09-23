'use client';

import { useEffect, useState } from 'react';

interface LoadingFallbackProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export default function LoadingFallback({
  message = "Loading...",
  timeout = 15000,
  onTimeout
}: LoadingFallbackProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#8B4513] mb-2">Taking longer than expected...</h2>
          <p className="text-gray-600 mb-4">Please check your internet connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-2 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-[#8B4513]">{message}</h2>
        <p className="text-gray-600 mt-2">Please wait...</p>
      </div>
    </div>
  );
}