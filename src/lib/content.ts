import { supabase } from './supabase';
import { ContentSection, SiteSetting } from '@/types/database';

// Cache for content to avoid multiple database calls
let contentCache: ContentSection[] | null = null;
let settingsCache: SiteSetting[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAllContent(): Promise<ContentSection[]> {
  // Check if cache is valid
  if (contentCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return contentCache;
  }

  try {
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .eq('is_active', true)
      .order('section_type');

    if (error) {
      console.log('Content sections not available, using fallbacks');
      return getFallbackContent();
    }

    contentCache = data || [];
    cacheTimestamp = Date.now();
    return contentCache;
  } catch (error) {
    console.log('Error fetching content, using fallbacks');
    return getFallbackContent();
  }
}

export async function getAllSettings(): Promise<SiteSetting[]> {
  // Check if cache is valid
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      console.log('Site settings not available, using fallbacks');
      return getFallbackSettings();
    }

    settingsCache = data || [];
    cacheTimestamp = Date.now();
    return settingsCache;
  } catch (error) {
    console.log('Error fetching settings, using fallbacks');
    return getFallbackSettings();
  }
}

export async function getContentByKey(sectionKey: string): Promise<string> {
  const content = await getAllContent();
  const section = content.find(item => item.section_key === sectionKey);
  return section?.content || getFallbackContentByKey(sectionKey);
}

export async function getSettingByKey(settingKey: string): Promise<string> {
  const settings = await getAllSettings();
  const setting = settings.find(item => item.setting_key === settingKey);
  return setting?.setting_value || getFallbackSettingByKey(settingKey);
}

export async function getContentByType(sectionType: string): Promise<ContentSection[]> {
  const content = await getAllContent();
  return content.filter(item => item.section_type === sectionType);
}

// Fallback content if database is not available
function getFallbackContent(): ContentSection[] {
  return [
    {
      id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section_key: 'hero_title',
      title: 'Hero Title',
      content: 'Discover Extraordinary Adventures',
      section_type: 'hero',
      is_active: true
    },
    {
      id: '2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section_key: 'hero_subtitle',
      title: 'Hero Subtitle',
      content: 'Embark on carefully curated luxury travel experiences that create lasting memories.',
      section_type: 'hero',
      is_active: true
    },
    {
      id: '3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section_key: 'about_title',
      title: 'About Us Title',
      content: 'About Meridian Luxury Travel',
      section_type: 'about',
      is_active: true
    },
    {
      id: '4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section_key: 'about_content',
      title: 'About Us Content',
      content: 'We specialize in creating bespoke travel experiences that exceed expectations. Our team of travel experts carefully crafts each journey to ensure unforgettable adventures that create lasting memories.',
      section_type: 'about',
      is_active: true
    }
  ];
}

function getFallbackSettings(): SiteSetting[] {
  return [
    {
      id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      setting_key: 'company_name',
      setting_value: 'Meridian Luxury Travel',
      setting_type: 'text',
      description: 'Company Name'
    },
    {
      id: '2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      setting_key: 'contact_email',
      setting_value: 'chris@meridianluxury.travel',
      setting_type: 'email',
      description: 'Main Contact Email'
    },
    {
      id: '3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      setting_key: 'contact_phone',
      setting_value: '+1 (555) 123-4567',
      setting_type: 'phone',
      description: 'Main Contact Phone'
    }
  ];
}

function getFallbackContentByKey(key: string): string {
  const fallbacks: { [key: string]: string } = {
    'hero_title': 'Discover Extraordinary Adventures',
    'hero_subtitle': 'Embark on carefully curated luxury travel experiences that create lasting memories.',
    'hero_cta': 'Start Your Journey',
    'about_title': 'About Meridian Luxury Travel',
    'about_content': 'We specialize in creating bespoke travel experiences that exceed expectations. Our team of travel experts carefully crafts each journey to ensure unforgettable adventures that create lasting memories.',
    'services_title': 'Our Services',
    'services_content': 'From luxury accommodations to unique experiences, we handle every detail of your travel adventure.',
    'contact_title': 'Get in Touch',
    'contact_content': 'Ready to plan your next adventure? Contact us today to start creating your perfect travel experience.',
    'footer_tagline': 'Creating extraordinary travel experiences since 2024.'
  };
  
  return fallbacks[key] || 'Content not found';
}

function getFallbackSettingByKey(key: string): string {
  const fallbacks: { [key: string]: string } = {
    'company_name': 'Meridian Luxury Travel',
    'contact_email': 'chris@meridianluxury.travel',
    'contact_phone': '+1 (555) 123-4567',
    'website_url': 'https://www.meridianluxury.travel',
    'company_address': '123 Travel Way, Adventure City, AC 12345',
    'business_hours': 'Monday - Friday: 9:00 AM - 6:00 PM EST',
    'tagline': 'Creating extraordinary travel experiences'
  };
  
  return fallbacks[key] || '';
}

// Clear cache function (useful for admin updates)
export function clearContentCache() {
  contentCache = null;
  settingsCache = null;
  cacheTimestamp = 0;
}