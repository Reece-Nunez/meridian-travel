'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to save and restore scroll position using percentage of page height.
 * Works with refresh, back button, and forward navigation.
 *
 * @param key - Unique key for this page (e.g., 'package-123', 'admin-quote-456')
 * @param isReady - Boolean indicating when content is loaded (e.g., !loading)
 */
export function usePercentageScrollRestoration(key: string, isReady: boolean = true) {
  const hasRestoredRef = useRef(false);
  const scrollKey = `scroll-percent-${key}`;

  // Save scroll position as percentage
  const saveScrollPosition = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      const scrollPercent = window.scrollY / maxScroll;
      sessionStorage.setItem(scrollKey, scrollPercent.toString());
    }
  };

  // Save scroll position on various events
  useEffect(() => {
    if (!isReady) return;

    // Save on scroll (debounced by browser)
    const handleScroll = () => {
      saveScrollPosition();
    };

    // Save before page unload (refresh)
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    // Save when page is hidden (back/forward navigation, tab switch)
    const handlePageHide = () => {
      saveScrollPosition();
    };

    // Save when visibility changes (mobile background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReady, scrollKey]);

  // Restore scroll position when content is ready
  useEffect(() => {
    if (!isReady) return;
    if (hasRestoredRef.current) return;

    const savedScrollPercent = sessionStorage.getItem(scrollKey);

    if (savedScrollPercent) {
      hasRestoredRef.current = true;

      // Don't remove immediately - keep it for a moment in case of re-renders
      // But do remove after successful restore

      // Wait for content and images to start rendering
      const timer = setTimeout(() => {
        const percent = parseFloat(savedScrollPercent);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = Math.round(maxScroll * percent);
        window.scrollTo(0, targetScroll);

        // Clear after restore
        sessionStorage.removeItem(scrollKey);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isReady, scrollKey]);
}
