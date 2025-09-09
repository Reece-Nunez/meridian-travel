#!/usr/bin/env node

/**
 * This script populates the content_sections table with the current fallback content
 * from your pages, so the CMS admin interface shows what's actually displayed on your site.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Current content from your site (extracted from fallbacks and hardcoded content)
const contentSections = [
  // Home page content
  {
    section_key: 'hero_title',
    title: 'Hero Title',
    content: 'Discover the Magic of South America',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'hero_subtitle',
    title: 'Hero Subtitle', 
    content: 'From Machu Picchu to Patagonia, explore South America\'s rich heritage and stunning landscapes with curated luxury adventures designed just for you.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'hero_cta',
    title: 'Hero CTA Button',
    content: 'Explore Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'hero_cta_secondary',
    title: 'Hero Secondary CTA',
    content: 'Plan Your Journey',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'about_title',
    title: 'About Title',
    content: 'Why Choose Meridian Luxury Travel?',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'about_content',
    title: 'About Content',
    content: 'We create personalized luxury adventures that go beyond typical tourist experiences.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_1_title',
    title: 'Feature 1 Title',
    content: 'Expert Local Knowledge',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_1_content',
    title: 'Feature 1 Content',
    content: 'Our Peru specialists have personally explored every destination we offer, ensuring authentic and meaningful experiences.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_2_title',
    title: 'Feature 2 Title',
    content: 'Tailored Experiences',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_2_content',
    title: 'Feature 2 Content',
    content: 'Every journey is carefully crafted around your interests, travel style, and budget for a truly personal adventure.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_3_title',
    title: 'Feature 3 Title',
    content: '24/7 Support',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'feature_3_content',
    title: 'Feature 3 Content',
    content: 'From planning to your safe return home, our dedicated team provides round-the-clock support for peace of mind.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'featured_destinations_title',
    title: 'Featured Destinations Title',
    content: 'Featured Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'featured_destinations_subtitle',
    title: 'Featured Destinations Subtitle',
    content: 'From ancient ruins to natural wonders, discover Peru\'s most captivating destinations.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_1_title',
    title: 'Destination 1 Title',
    content: 'Machu Picchu',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_1_content',
    title: 'Destination 1 Content',
    content: 'Explore the mystical ancient citadel and marvel at Incan engineering prowess.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_2_title',
    title: 'Destination 2 Title',
    content: 'Amazon Rainforest',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_2_content',
    title: 'Destination 2 Content',
    content: 'Immerse yourself in the world\'s most biodiverse ecosystem with expert naturalist guides.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_3_title',
    title: 'Destination 3 Title',
    content: 'Sacred Valley',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destination_3_content',
    title: 'Destination 3 Content',
    content: 'Experience authentic Andean culture and visit traditional markets and villages.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'cta_title',
    title: 'CTA Title',
    content: 'Ready to Begin Your Peru Adventure?',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'cta_subtitle',
    title: 'CTA Subtitle',
    content: 'Let our Peru experts create a personalized itinerary tailored to your dreams and interests.',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'cta_button',
    title: 'CTA Button',
    content: 'Request Your Custom Quote',
    section_type: 'hero',
    is_active: true
  }
];

const siteSettings = [
  {
    setting_key: 'company_name',
    setting_value: 'Meridian Luxury Travel',
    setting_type: 'text',
    description: 'Company name displayed throughout the site'
  },
  {
    setting_key: 'contact_email',
    setting_value: 'chris@meridianluxury.travel',
    setting_type: 'email',
    description: 'Main contact email address'
  },
  {
    setting_key: 'contact_phone',
    setting_value: '+1 (555) 012-3456',
    setting_type: 'phone',
    description: 'Main contact phone number'
  }
];

async function populateContentSections() {
  console.log('Starting content population...');
  
  try {
    // Check if content already exists
    const { data: existingContent } = await supabase
      .from('content_sections')
      .select('section_key');
    
    const existingKeys = new Set(existingContent?.map(item => item.section_key) || []);
    const newContentSections = contentSections.filter(section => !existingKeys.has(section.section_key));
    
    if (newContentSections.length === 0) {
      console.log('All content sections already exist in database');
      return;
    }
    
    console.log(`Inserting ${newContentSections.length} new content sections...`);
    
    const { data, error } = await supabase
      .from('content_sections')
      .insert(newContentSections);
    
    if (error) {
      console.error('Error inserting content sections:', error);
      return;
    }
    
    console.log(`✅ Successfully inserted ${newContentSections.length} content sections`);
  } catch (error) {
    console.error('Error in populateContentSections:', error);
  }
}

async function populateSiteSettings() {
  console.log('Starting site settings population...');
  
  try {
    // Use upsert to handle conflicts
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(siteSettings, { 
        onConflict: 'setting_key',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error inserting site settings:', error);
      return;
    }
    
    console.log(`✅ Successfully upserted ${siteSettings.length} site settings`);
  } catch (error) {
    console.error('Error in populateSiteSettings:', error);
  }
}

async function main() {
  console.log('🚀 Populating CMS with existing site content...\n');
  
  await populateContentSections();
  await populateSiteSettings();
  
  console.log('\n✅ Content population complete!');
  console.log('Your CMS admin interface should now show all existing content as editable.');
  
  process.exit(0);
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});