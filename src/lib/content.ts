import { supabase } from './supabase';
import { ContentSection, SiteSetting } from '@/types/database';

// Storage keys for localStorage
const CONTENT_STORAGE_KEY = 'meridian_content_cache';
const SETTINGS_STORAGE_KEY = 'meridian_settings_cache';
const CACHE_VERSION_KEY = 'meridian_cache_version';
const CURRENT_CACHE_VERSION = '1.0';

// In-memory cache for performance (backed by localStorage)
let contentCache: ContentSection[] | null = null;
let settingsCache: SiteSetting[] | null = null;
let memoryCacheTimestamp: number = 0;
const MEMORY_CACHE_DURATION = 60 * 1000; // 1 minute for memory cache

// Helper to safely access localStorage
function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // Check cache version
    const version = localStorage.getItem(CACHE_VERSION_KEY);
    if (version !== CURRENT_CACHE_VERSION) {
      // Clear old cache on version mismatch
      localStorage.removeItem(CONTENT_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      return null;
    }

    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
  }
}

// Check if we're in preview mode (client-side only)
export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === 'true';
}

// Get cached content instantly (from memory or localStorage)
export function getCachedContent(): ContentSection[] | null {
  // Try memory cache first (fastest)
  if (contentCache && Date.now() - memoryCacheTimestamp < MEMORY_CACHE_DURATION) {
    return contentCache;
  }

  // Fall back to localStorage cache
  const storedContent = getFromStorage<ContentSection[]>(CONTENT_STORAGE_KEY);
  if (storedContent) {
    // Populate memory cache from localStorage
    contentCache = storedContent;
    memoryCacheTimestamp = Date.now();
    return storedContent;
  }

  return null;
}

// Get cached settings instantly (from memory or localStorage)
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

// Fetch fresh content from database
export async function getAllContent(includePreview: boolean = false): Promise<ContentSection[]> {
  const usePreview = includePreview || (typeof window !== 'undefined' && isPreviewMode());

  try {
    // Race the query against a timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Content query timeout')), 5000); // Increased to 5 seconds
    });

    const queryPromise = supabase
      .from('content_sections')
      .select('*')
      .eq('is_active', true)
      .order('section_type');

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.warn('Content sections fetch error:', error.message);
      // Return cached content if available, otherwise null
      return getCachedContent() || [];
    }

    let content = data || [];

    // In preview mode, use draft_content if available
    if (usePreview) {
      content = content.map(item => ({
        ...item,
        content: item.draft_content || item.content
      }));
    }

    // Update both memory and localStorage cache (skip for preview mode)
    if (!usePreview && content.length > 0) {
      contentCache = content;
      memoryCacheTimestamp = Date.now();
      saveToStorage(CONTENT_STORAGE_KEY, content);
    }

    return content;
  } catch (error) {
    console.warn('Error fetching content:', error);
    // Return cached content if available
    return getCachedContent() || [];
  }
}

// Fetch fresh settings from database
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
      console.warn('Settings fetch error:', error.message);
      return getCachedSettings() || [];
    }

    const settings = data || [];

    // Update both memory and localStorage cache
    if (settings.length > 0) {
      settingsCache = settings;
      saveToStorage(SETTINGS_STORAGE_KEY, settings);
    }

    return settings;
  } catch (error) {
    console.warn('Error fetching settings:', error);
    return getCachedSettings() || [];
  }
}

// Get content by key - returns null if not found (no hardcoded fallback)
export async function getContentByKey(sectionKey: string): Promise<string | null> {
  const content = await getAllContent();
  const section = content.find(item => item.section_key === sectionKey);
  return section?.content || null;
}

// Get cached content by key instantly (no database call)
export function getCachedContentByKey(sectionKey: string): string | null {
  const content = getCachedContent();
  if (!content) return null;
  const section = content.find(item => item.section_key === sectionKey);
  return section?.content || null;
}

// Get setting by key - returns null if not found (no hardcoded fallback)
export async function getSettingByKey(settingKey: string): Promise<string | null> {
  const settings = await getAllSettings();
  const setting = settings.find(item => item.setting_key === settingKey);
  return setting?.setting_value || null;
}

// Get cached setting by key instantly (no database call)
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

// Clear all caches (call this when admin publishes content)
export function clearContentCache() {
  console.log('🗑️ Clearing content and settings cache...');

  // Clear memory cache
  contentCache = null;
  settingsCache = null;
  memoryCacheTimestamp = 0;

  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);

    // Dispatch event for components to refresh
    window.dispatchEvent(new CustomEvent('contentCacheCleared'));
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
  }
}

// Force refresh content from database (useful after admin updates)
export async function refreshContent(): Promise<void> {
  console.log('🔄 Force refreshing content from database...');

  // Clear memory cache to force database fetch
  contentCache = null;
  settingsCache = null;
  memoryCacheTimestamp = 0;

  // Fetch fresh data
  await Promise.all([getAllContent(), getAllSettings()]);

  // Notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contentRefreshed'));
  }
}

// Broadcast cache invalidation across tabs
export function broadcastCacheInvalidation(): void {
  if (typeof window === 'undefined') return;

  // Use BroadcastChannel for cross-tab communication
  try {
    const channel = new BroadcastChannel('meridian_cache_channel');
    channel.postMessage({ type: 'INVALIDATE_CACHE', timestamp: Date.now() });
    channel.close();
  } catch (error) {
    // BroadcastChannel not supported, use localStorage event
    localStorage.setItem('meridian_cache_invalidate', Date.now().toString());
  }
}

// Listen for cache invalidation from other tabs
export function setupCacheInvalidationListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'INVALIDATE_CACHE') {
      console.log('📢 Received cache invalidation from another tab');
      clearContentCache();
      refreshContent();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'meridian_cache_invalidate') {
      console.log('📢 Received cache invalidation via storage event');
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
