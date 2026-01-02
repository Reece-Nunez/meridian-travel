import { supabase } from '@/lib/supabase';

export interface HeroSettings {
  hero_image_url: string | null;
  focal_point_x: number;
  focal_point_y: number;
  hero_height_mobile: string;
  hero_height_desktop: string;
  overlay_opacity: number;
}

const defaultSettings: HeroSettings = {
  hero_image_url: null,
  focal_point_x: 50,
  focal_point_y: 50,
  hero_height_mobile: '400px',
  hero_height_desktop: '500px',
  overlay_opacity: 0.5
};

// Cache for hero settings
const settingsCache: { [key: string]: { data: HeroSettings; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getHeroSettings(pageSlug: string): Promise<HeroSettings> {
  // Check cache first
  const cached = settingsCache[pageSlug];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from('page_hero_settings')
      .select('hero_image_url, focal_point_x, focal_point_y, hero_height_mobile, hero_height_desktop, overlay_opacity')
      .eq('page_slug', pageSlug)
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    const settings: HeroSettings = {
      hero_image_url: data.hero_image_url,
      focal_point_x: data.focal_point_x ?? 50,
      focal_point_y: data.focal_point_y ?? 50,
      hero_height_mobile: data.hero_height_mobile ?? '400px',
      hero_height_desktop: data.hero_height_desktop ?? '500px',
      overlay_opacity: data.overlay_opacity ?? 0.5
    };

    // Update cache
    settingsCache[pageSlug] = { data: settings, timestamp: Date.now() };

    return settings;
  } catch (error) {
    console.error(`Error fetching hero settings for ${pageSlug}:`, error);
    return defaultSettings;
  }
}

export function clearHeroSettingsCache(pageSlug?: string) {
  if (pageSlug) {
    delete settingsCache[pageSlug];
  } else {
    Object.keys(settingsCache).forEach(key => delete settingsCache[key]);
  }
}
