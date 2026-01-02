'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCachedContent,
  getCachedSettings,
  getCachedContentByKey,
  getCachedSettingByKey,
  getAllContent,
  getAllSettings,
  getContentByKey,
  getSettingByKey,
  setupCacheInvalidationListener
} from '@/lib/content';
import { ContentSection, SiteSetting } from '@/types/database';

interface UseContentResult {
  content: Record<string, string>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

interface UseSettingsResult {
  settings: Record<string, string>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage CMS content with skeleton loading support
 * @param keys - Array of content section keys to fetch
 * @returns Object with content values, loading state, and refresh function
 */
export function useContent(keys: string[]): UseContentResult {
  // Always start with loading=true to avoid hydration mismatch
  // (localStorage is only available on client)
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // After mount, check cache and update state
  useEffect(() => {
    setHasMounted(true);
    const initial: Record<string, string> = {};
    keys.forEach(key => {
      const cached = getCachedContentByKey(key);
      if (cached) initial[key] = cached;
    });
    if (Object.keys(initial).length > 0) {
      setContent(initial);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      // Fetch all requested keys in parallel
      const results = await Promise.all(
        keys.map(async (key) => {
          const value = await getContentByKey(key);
          return { key, value };
        })
      );

      const newContent: Record<string, string> = {};
      results.forEach(({ key, value }) => {
        if (value) newContent[key] = value;
      });

      setContent(prev => ({ ...prev, ...newContent }));
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch content'));
    } finally {
      setIsLoading(false);
    }
  }, [keys.join(',')]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    fetchContent();

    // Listen for cache invalidation events
    const handleCacheCleared = () => {
      console.log('🔄 Content cache cleared, refreshing...');
      fetchContent();
    };

    const handleContentRefreshed = () => {
      console.log('🔄 Content refreshed, updating...');
      fetchContent();
    };

    window.addEventListener('contentCacheCleared', handleCacheCleared);
    window.addEventListener('contentRefreshed', handleContentRefreshed);

    // Setup cross-tab cache invalidation
    const cleanup = setupCacheInvalidationListener();

    return () => {
      window.removeEventListener('contentCacheCleared', handleCacheCleared);
      window.removeEventListener('contentRefreshed', handleContentRefreshed);
      cleanup();
    };
  }, [fetchContent]);

  return { content, isLoading, hasLoaded, error, refresh };
}

/**
 * Hook to fetch a single content key
 * @param key - Content section key
 * @returns Object with value, loading state, and refresh function
 */
export function useSingleContent(key: string): {
  value: string | null;
  isLoading: boolean;
  hasLoaded: boolean;
  refresh: () => Promise<void>;
} {
  const { content, isLoading, hasLoaded, refresh } = useContent([key]);
  return {
    value: content[key] || null,
    isLoading,
    hasLoaded,
    refresh
  };
}

/**
 * Hook to fetch and manage site settings with skeleton loading support
 * @param keys - Array of setting keys to fetch
 * @returns Object with settings values, loading state, and refresh function
 */
export function useSettings(keys: string[]): UseSettingsResult {
  // Always start with loading=true to avoid hydration mismatch
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // After mount, check cache and update state
  useEffect(() => {
    const initial: Record<string, string> = {};
    keys.forEach(key => {
      const cached = getCachedSettingByKey(key);
      if (cached) initial[key] = cached;
    });
    if (Object.keys(initial).length > 0) {
      setSettings(initial);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const results = await Promise.all(
        keys.map(async (key) => {
          const value = await getSettingByKey(key);
          return { key, value };
        })
      );

      const newSettings: Record<string, string> = {};
      results.forEach(({ key, value }) => {
        if (value) newSettings[key] = value;
      });

      setSettings(prev => ({ ...prev, ...newSettings }));
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      setIsLoading(false);
    }
  }, [keys.join(',')]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();

    const handleSettingsUpdated = () => {
      console.log('🔄 Settings updated, refreshing...');
      fetchSettings();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdated);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdated);
    };
  }, [fetchSettings]);

  return { settings, isLoading, hasLoaded, error, refresh };
}

/**
 * Hook to fetch a single setting
 * @param key - Setting key
 * @returns Object with value, loading state, and refresh function
 */
export function useSingleSetting(key: string): {
  value: string | null;
  isLoading: boolean;
  hasLoaded: boolean;
  refresh: () => Promise<void>;
} {
  const { settings, isLoading, hasLoaded, refresh } = useSettings([key]);
  return {
    value: settings[key] || null,
    isLoading,
    hasLoaded,
    refresh
  };
}

/**
 * Combined hook for fetching both content and settings
 * Useful for pages that need multiple types of data
 */
export function useCMSData(contentKeys: string[], settingKeys: string[]) {
  const contentResult = useContent(contentKeys);
  const settingsResult = useSettings(settingKeys);

  return {
    content: contentResult.content,
    settings: settingsResult.settings,
    isLoading: contentResult.isLoading || settingsResult.isLoading,
    hasLoaded: contentResult.hasLoaded && settingsResult.hasLoaded,
    refresh: async () => {
      await Promise.all([contentResult.refresh(), settingsResult.refresh()]);
    }
  };
}
