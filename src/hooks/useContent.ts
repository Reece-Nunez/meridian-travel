'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCachedContentByKey,
  getCachedSettingByKey,
  getContentByKey,
  getSettingByKey,
  setupCacheInvalidationListener
} from '@/lib/content';

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

export function useContent(keys: string[]): UseContentResult {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

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

    const handleCacheCleared = () => fetchContent();
    const handleContentRefreshed = () => fetchContent();

    window.addEventListener('contentCacheCleared', handleCacheCleared);
    window.addEventListener('contentRefreshed', handleContentRefreshed);

    const cleanup = setupCacheInvalidationListener();

    return () => {
      window.removeEventListener('contentCacheCleared', handleCacheCleared);
      window.removeEventListener('contentRefreshed', handleContentRefreshed);
      cleanup();
    };
  }, [fetchContent]);

  return { content, isLoading, hasLoaded, error, refresh };
}

export function useSingleContent(key: string) {
  const { content, isLoading, hasLoaded, refresh } = useContent([key]);
  return {
    value: content[key] || null,
    isLoading,
    hasLoaded,
    refresh
  };
}

export function useSettings(keys: string[]): UseSettingsResult {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

    const handleSettingsUpdated = () => fetchSettings();

    window.addEventListener('settingsUpdated', handleSettingsUpdated);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdated);
  }, [fetchSettings]);

  return { settings, isLoading, hasLoaded, error, refresh };
}

export function useSingleSetting(key: string) {
  const { settings, isLoading, hasLoaded, refresh } = useSettings([key]);
  return {
    value: settings[key] || null,
    isLoading,
    hasLoaded,
    refresh
  };
}

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
