#!/usr/bin/env node

/**
 * This script clears existing content_sections and repopulates with correct section_type values
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Current content with proper section_type values that match database constraints
const contentSections = [
  // Home page content - using 'hero' section_type
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
  
  // About section content
  {
    section_key: 'about_title',
    title: 'About Title',
    content: 'Why Choose Meridian Luxury Travel?',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_content',
    title: 'About Content',
    content: 'We create personalized luxury adventures that go beyond typical tourist experiences.',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'feature_1_title',
    title: 'Feature 1 Title',
    content: 'Expert Local Knowledge',
    section_type: 'services',
    is_active: true
  },
  {
    section_key: 'feature_1_content',
    title: 'Feature 1 Content',
    content: 'Our Peru specialists have personally explored every destination we offer, ensuring authentic and meaningful experiences.',
    section_type: 'services',
    is_active: true
  },
  {
    section_key: 'feature_2_title',
    title: 'Feature 2 Title',
    content: 'Tailored Experiences',
    section_type: 'services',
    is_active: true
  },
  {
    section_key: 'feature_2_content',
    title: 'Feature 2 Content',
    content: 'Every journey is carefully crafted around your interests, travel style, and budget for a truly personal adventure.',
    section_type: 'services',
    is_active: true
  },
  {
    section_key: 'feature_3_title',
    title: 'Feature 3 Title',
    content: '24/7 Support',
    section_type: 'services',
    is_active: true
  },
  {
    section_key: 'feature_3_content',
    title: 'Feature 3 Content',
    content: 'From planning to your safe return home, our dedicated team provides round-the-clock support for peace of mind.',
    section_type: 'services',
    is_active: true
  },
  
  // Featured destinations
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
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'cta_subtitle',
    title: 'CTA Subtitle',
    content: 'Let our Peru experts create a personalized itinerary tailored to your dreams and interests.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'cta_button',
    title: 'CTA Button',
    content: 'Request Your Custom Quote',
    section_type: 'contact',
    is_active: true
  }
];

async function clearAndPopulateContent() {
  console.log('🚀 Clearing and repopulating CMS content...\n');
  
  try {
    // Clear existing content_sections
    console.log('Clearing existing content sections...');
    const { error: deleteError } = await supabase
      .from('content_sections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing content sections:', deleteError);
      return;
    }
    console.log('✅ Cleared existing content sections');

    // Insert new content with correct section_types
    console.log('Inserting new content sections...');
    const { data, error: insertError } = await supabase
      .from('content_sections')
      .insert(contentSections);
    
    if (insertError) {
      console.error('Error inserting content sections:', insertError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${contentSections.length} content sections`);
    
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
  
  console.log('\n✅ Content population complete!');
  console.log('Your CMS admin interface should now show all existing content as editable.');
  
  process.exit(0);
}

clearAndPopulateContent();