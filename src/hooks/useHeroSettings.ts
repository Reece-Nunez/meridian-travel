'use client';

import { useState, useEffect } from 'react';
import { getHeroSettings, clearHeroSettingsCache } from '@/lib/heroSettings';

interface HeroSettingsState {
  imageUrl: string;
  focalX: number;
  focalY: number;
  overlayOpacity: number;
}

/**
 * Hook to fetch hero settings from the database for a specific page
 * @param pageSlug - The slug of the page (e.g., 'about', 'contact', 'peru')
 * @param defaultImageUrl - Fallback image URL if none in database
 */
export function useHeroSettings(pageSlug: string, defaultImageUrl: string) {
  const [heroSettings, setHeroSettings] = useState<HeroSettingsState>({
    imageUrl: defaultImageUrl,
    focalX: 50,
    focalY: 50,
    overlayOpacity: 0.5
  });

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        clearHeroSettingsCache(pageSlug);
        const settings = await getHeroSettings(pageSlug);
        setHeroSettings({
          imageUrl: settings.hero_image_url || defaultImageUrl,
          focalX: settings.focal_point_x,
          focalY: settings.focal_point_y,
          overlayOpacity: settings.overlay_opacity
        });
      } catch (error) {
        console.log(`Hero settings unavailable for ${pageSlug}, using defaults`);
      }
    };
    fetchHeroSettings();
  }, [pageSlug, defaultImageUrl]);

  return heroSettings;
}
