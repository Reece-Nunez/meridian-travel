import { supabase } from './supabase';
import { ContentSection, SiteSetting } from '@/types/database';

const CONTENT_STORAGE_KEY = 'meridian_content_cache';
const SETTINGS_STORAGE_KEY = 'meridian_settings_cache';
const CACHE_VERSION_KEY = 'meridian_cache_version';
const CURRENT_CACHE_VERSION = '1.0';

let contentCache: ContentSection[] | null = null;
let settingsCache: SiteSetting[] | null = null;
let memoryCacheTimestamp: number = 0;
const MEMORY_CACHE_DURATION = 60 * 1000;

function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const version = localStorage.getItem(CACHE_VERSION_KEY);
    if (version !== CURRENT_CACHE_VERSION) {
      localStorage.removeItem(CONTENT_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      return null;
    }

    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  } catch {
    // localStorage full or unavailable
  }
}

export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === 'true';
}

export function getCachedContent(): ContentSection[] | null {
  if (contentCache && Date.now() - memoryCacheTimestamp < MEMORY_CACHE_DURATION) {
    return contentCache;
  }

  const storedContent = getFromStorage<ContentSection[]>(CONTENT_STORAGE_KEY);
  if (storedContent) {
    contentCache = storedContent;
    memoryCacheTimestamp = Date.now();
    return storedContent;
  }

  return null;
}

export function getCachedSettings(): SiteSetting[] | null {
  if (settingsCache && Date.now() - memoryCacheTimestamp < MEMORY_CACHE_DURATION) {
    return settingsCache;
  }

  const storedSettings = getFromStorage<SiteSetting[]>(SETTINGS_STORAGE_KEY);
  if (storedSettings) {
    settingsCache = storedSettings;
    return storedSettings;
  }

  return null;
}

export async function getAllContent(includePreview: boolean = false): Promise<ContentSection[]> {
  const usePreview = includePreview || (typeof window !== 'undefined' && isPreviewMode());

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Content query timeout')), 5000);
    });

    const queryPromise = supabase
      .from('content_sections')
      .select('*')
      .eq('is_active', true)
      .order('section_type');

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      return getCachedContent() || [];
    }

    let content = data || [];

    if (usePreview) {
      content = content.map(item => ({
        ...item,
        content: item.draft_content || item.content
      }));
    }

    if (!usePreview && content.length > 0) {
      contentCache = content;
      memoryCacheTimestamp = Date.now();
      saveToStorage(CONTENT_STORAGE_KEY, content);
    }

    return content;
  } catch {
    return getCachedContent() || [];
  }
}

export async function getAllSettings(): Promise<SiteSetting[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Settings query timeout')), 5000);
    });

    const queryPromise = supabase
      .from('site_settings')
      .select('*')
      .order('setting_key');

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      return getCachedSettings() || [];
    }

    const settings = data || [];

    if (settings.length > 0) {
      settingsCache = settings;
      saveToStorage(SETTINGS_STORAGE_KEY, settings);
    }

    return settings;
  } catch {
    return getCachedSettings() || [];
  }
}

export async function getContentByKey(sectionKey: string): Promise<string | null> {
  const content = await getAllContent();
  const section = content.find(item => item.section_key === sectionKey);
  return section?.content || null;
}

export function getCachedContentByKey(sectionKey: string): string | null {
  const content = getCachedContent();
  if (!content) return null;
  const section = content.find(item => item.section_key === sectionKey);
  return section?.content || null;
}

export async function getSettingByKey(settingKey: string): Promise<string | null> {
  const settings = await getAllSettings();
  const setting = settings.find(item => item.setting_key === settingKey);
  return setting?.setting_value || null;
}

export function getCachedSettingByKey(settingKey: string): string | null {
  const settings = getCachedSettings();
  if (!settings) return null;
  const setting = settings.find(item => item.setting_key === settingKey);
  return setting?.setting_value || null;
}

export async function getContentByType(sectionType: string): Promise<ContentSection[]> {
  const content = await getAllContent();
  return content.filter(item => item.section_type === sectionType);
}

export function clearContentCache() {
  contentCache = null;
  settingsCache = null;
  memoryCacheTimestamp = 0;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);

    window.dispatchEvent(new CustomEvent('contentCacheCleared'));
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
  }
}

export async function refreshContent(): Promise<void> {
  contentCache = null;
  settingsCache = null;
  memoryCacheTimestamp = 0;

  await Promise.all([getAllContent(), getAllSettings()]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contentRefreshed'));
  }
}

export function broadcastCacheInvalidation(): void {
  if (typeof window === 'undefined') return;

  try {
    const channel = new BroadcastChannel('meridian_cache_channel');
    channel.postMessage({ type: 'INVALIDATE_CACHE', timestamp: Date.now() });
    channel.close();
  } catch {
    localStorage.setItem('meridian_cache_invalidate', Date.now().toString());
  }
}

export function setupCacheInvalidationListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'INVALIDATE_CACHE') {
      clearContentCache();
      refreshContent();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'meridian_cache_invalidate') {
      clearContentCache();
      refreshContent();
    }
  };

  try {
    const channel = new BroadcastChannel('meridian_cache_channel');
    channel.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);

    return () => {
      channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  } catch {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }
}
