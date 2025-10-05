'use client';

import Link from 'next/link';

export default function SplashNavigation() {
  return (
    <nav className="bg-[#F5F5DC] shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-22 py-4">
          {/* Center - Logo and brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Meridian Luxury Travel"
                className="h-20 w-20"
                onError={(e) => {
                  console.error('Failed to load logo.png');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
            <Link href="/" className="flex-shrink-0">
              <div className="text-center">
                <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#8B4513] tracking-wide leading-tight">
                  Meridian Luxury Travel
                </h1>
                <p className="text-xs lg:text-sm font-serif text-[#B8860B] tracking-wider">
                  Tailor-Made Journeys
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
