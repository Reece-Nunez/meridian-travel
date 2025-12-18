'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to save and restore scroll position for a page.
 * Useful for returning to the same scroll position after navigating back.
 *
 * @param key - Unique key to store the scroll position (e.g., 'packages', 'cruises')
 * @param isReady - Boolean indicating when the page content is ready (e.g., !loading)
 */
export function useScrollRestoration(key: string, isReady: boolean = true) {
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  // Save scroll position when clicking a link (before navigating away)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('#')) {
        // Only save scroll position for internal navigation that goes "deeper"
        // (e.g., from /packages to /packages/123, not header/footer nav links)
        const currentPath = window.location.pathname;
        const linkPath = new URL(link.href, window.location.origin).pathname;

        // Save if navigating to a child route or related detail page
        const isChildRoute = linkPath.startsWith(currentPath) && linkPath !== currentPath;
        const isDetailPage = linkPath.includes('/packages/') ||
                           linkPath.includes('/ships/') ||
                           linkPath.includes('/cruises/');

        if (isChildRoute || isDetailPage) {
          const pos = window.scrollY;
          if (pos > 0) {
            sessionStorage.setItem(`${key}ScrollPosition`, pos.toString());
            sessionStorage.setItem(`${key}ScrollFrom`, currentPath);
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [key]);

  // Restore scroll position on mount when content is ready
  useEffect(() => {
    if (!isReady) return;
    if (hasRestoredRef.current) return;

    hasRestoredRef.current = true;

    const savedPosition = sessionStorage.getItem(`${key}ScrollPosition`);
    const savedFrom = sessionStorage.getItem(`${key}ScrollFrom`);

    // Clear saved position immediately to prevent issues on refresh
    sessionStorage.removeItem(`${key}ScrollPosition`);
    sessionStorage.removeItem(`${key}ScrollFrom`);

    if (!savedPosition || !savedFrom) return;

    // Only restore if we're back on the same page we saved from
    if (savedFrom !== window.location.pathname) return;

    const targetPosition = parseInt(savedPosition);
    if (targetPosition === 0) return;

    isRestoringRef.current = true;

    const scrollToPosition = (attempts = 0) => {
      if (attempts > 50) {
        isRestoringRef.current = false;
        return;
      }

      window.scrollTo(0, targetPosition);

      setTimeout(() => {
        const currentPosition = window.scrollY;
        if (Math.abs(currentPosition - targetPosition) < 100) {
          isRestoringRef.current = false;
        } else {
          scrollToPosition(attempts + 1);
        }
      }, 30);
    };

    // Delay to let content render
    setTimeout(() => scrollToPosition(), 100);
  }, [key, isReady]);
}
