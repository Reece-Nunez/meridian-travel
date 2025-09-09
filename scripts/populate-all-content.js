#!/usr/bin/env node

/**
 * Complete content population script - includes ALL pages
 * This populates Home, About, Contact, Destinations, Navigation, and Footer content
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

// Complete content sections for ALL pages
const contentSections = [
  // ===== HOME PAGE CONTENT (hero section) =====
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
  // Home page "Why Choose Us" section
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
  },

  // ===== ABOUT PAGE CONTENT =====
  {
    section_key: 'about_page_title',
    title: 'Page Title',
    content: 'About Meridian Luxury Travel',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_page_content',
    title: 'Main Content',
    content: 'At Meridian Luxury Travel, we specialize in crafting tailor-made journeys for discerning travelers who seek more than just a vacation—they seek an experience that resonates deeply. Our focus is on personalized, high-end itineraries that blend exclusivity, comfort, and cultural depth, creating moments that linger long after the journey ends.',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_story_title',
    title: 'Story Title',
    content: 'Our Story',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_story_content',
    title: 'Story Content',
    content: 'Whether it\'s embarking on a private yacht excursion in the Galápagos, watching the sunrise over Machu Picchu, traveling aboard the legendary Hiram Bingham train, or enjoying exclusive access to historic landmarks closed to the public, each journey is designed with meticulous attention to detail. We believe true luxury lies in the combination of iconic destinations and insider access.',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_services_title',
    title: 'Services Title',
    content: 'Our Services',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_services_content',
    title: 'Services Content',
    content: 'At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury.',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_commitment_title',
    title: 'Commitment Title',
    content: 'Our Commitment to You',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_commitment_content',
    title: 'Commitment Content',
    content: 'Your dreams become our mission. Your adventure becomes our passion. Let us show you why Meridian Luxury Travel will become one of the most meaningful travel experiences of your life.',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_commitment_cta',
    title: 'Commitment CTA',
    content: 'Start Planning Your Peru Adventure',
    section_type: 'about',
    is_active: true
  },

  // ===== CONTACT PAGE CONTENT =====
  {
    section_key: 'contact_page_title',
    title: 'Page Title',
    content: 'Contact Us',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_page_subtitle',
    title: 'Page Subtitle',
    content: 'Ready to begin your Peru adventure? Our travel specialists are here to help you plan the perfect journey.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_section_title',
    title: 'Section Title',
    content: 'Get in Touch',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_phone',
    title: 'Phone Number',
    content: '+1 (555) 012-3456',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_phone_hours',
    title: 'Phone Hours',
    content: 'Monday - Friday: 9:00 AM - 6:00 PM EST\\nSaturday: 10:00 AM - 4:00 PM EST',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_email',
    title: 'Email Address',
    content: 'info@meridiantravel.com',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_email_response',
    title: 'Email Response Time',
    content: 'We respond to all inquiries within 24 hours',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_address',
    title: 'Office Address',
    content: '123 Travel Avenue\\nAdventure City, AC 12345\\nUnited States',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_emergency_phone',
    title: 'Emergency Phone',
    content: '+1 (555) 019-9999',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_emergency_text',
    title: 'Emergency Text',
    content: '24/7 emergency support for travelers',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_quick_action_title',
    title: 'Quick Action Title',
    content: 'Ready to Start Planning?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_quick_action_content',
    title: 'Quick Action Content',
    content: 'The fastest way to get your custom Peru itinerary is to request a quote online. Our specialists will contact you within 24 hours.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_quick_action_button',
    title: 'Quick Action Button',
    content: 'Request Your Quote',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_title',
    title: 'FAQ Title',
    content: 'Frequently Asked Questions',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_1_question',
    title: 'FAQ 1 Question',
    content: 'How far in advance should I book my Peru trip?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_1_answer',
    title: 'FAQ 1 Answer',
    content: 'We recommend booking at least 3-6 months in advance, especially for travel during peak season (May-September). Popular experiences like the Inca Trail require permits that sell out quickly, so earlier booking ensures better availability.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_2_question',
    title: 'FAQ 2 Question',
    content: 'What\'s included in your Peru travel packages?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_2_answer',
    title: 'FAQ 2 Answer',
    content: 'Our packages typically include accommodations, transportation, guided tours, entrance fees, and most meals. Each itinerary is custom-built, so inclusions vary based on your preferences and budget. We\'ll provide a detailed breakdown when we send your quote.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_3_question',
    title: 'FAQ 3 Question',
    content: 'Do you provide travel insurance recommendations?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_3_answer',
    title: 'FAQ 3 Answer',
    content: 'Yes, we strongly recommend travel insurance for all Peru trips. We can provide recommendations for reputable insurance providers that offer coverage for adventure activities and high-altitude destinations.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_4_question',
    title: 'FAQ 4 Question',
    content: 'What if I need to change my travel dates?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_4_answer',
    title: 'FAQ 4 Answer',
    content: 'We understand that plans can change. Depending on how far in advance you notify us and the specific services booked, we\'ll work with our partners to minimize any change fees. Our team will guide you through the process.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_5_question',
    title: 'FAQ 5 Question',
    content: 'Do you offer group discounts?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_5_answer',
    title: 'FAQ 5 Answer',
    content: 'Yes! We offer competitive pricing for groups of 8 or more travelers. Group travel also allows for more customization options and can include private guides and exclusive experiences.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_6_question',
    title: 'FAQ 6 Question',
    content: 'What support do you provide during my trip?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_faq_6_answer',
    title: 'FAQ 6 Answer',
    content: 'You\'ll have access to our 24/7 emergency support line throughout your journey. We also provide detailed pre-departure information and can assist with any issues that arise during your trip.',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_cta_title',
    title: 'CTA Title',
    content: 'Still Have Questions?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_cta_subtitle',
    title: 'CTA Subtitle',
    content: 'Our Peru travel specialists are here to help. Don\'t hesitate to reach out—we love talking about Peru adventures!',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_cta_button_1',
    title: 'CTA Button 1',
    content: 'Call Us Now',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'contact_cta_button_2',
    title: 'CTA Button 2',
    content: 'Send an Email',
    section_type: 'contact',
    is_active: true
  },

  // ===== DESTINATIONS PAGE CONTENT =====
  {
    section_key: 'destinations_page_title',
    title: 'Page Title',
    content: 'Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_page_subtitle',
    title: 'Page Subtitle',
    content: 'Discover extraordinary destinations across South America',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_available_title',
    title: 'Available Title',
    content: 'Available Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_available_subtitle',
    title: 'Available Subtitle',
    content: 'Explore these incredible destinations with our expert guides',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_coming_title',
    title: 'Coming Soon Title',
    content: 'Coming Soon',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_coming_subtitle',
    title: 'Coming Soon Subtitle',
    content: 'More exciting destinations launching soon',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'destinations_cta_title',
    title: 'CTA Title',
    content: 'Ready to Explore?',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'destinations_cta_subtitle',
    title: 'CTA Subtitle',
    content: 'Let us create your perfect South American adventure',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'destinations_cta_button_1',
    title: 'CTA Button 1',
    content: 'Get Your Quote',
    section_type: 'contact',
    is_active: true
  },
  {
    section_key: 'destinations_cta_button_2',
    title: 'CTA Button 2',
    content: 'Contact Us',
    section_type: 'contact',
    is_active: true
  },

  // ===== NAVIGATION & GLOBAL CONTENT =====
  {
    section_key: 'nav_company_name',
    title: 'Company Name',
    content: 'Meridian Luxury Travel',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_company_tagline',
    title: 'Company Tagline',
    content: 'Creating extraordinary travel experiences',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_login_text',
    title: 'Login Text',
    content: 'Sign In',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_get_quote_text',
    title: 'Get Quote Text',
    content: 'Get Quote',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_dashboard_text',
    title: 'Dashboard Text',
    content: 'Dashboard',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_profile_text',
    title: 'Profile Text',
    content: 'Profile',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_sign_out_text',
    title: 'Sign Out Text',
    content: 'Sign Out',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_destinations_text',
    title: 'Destinations Menu',
    content: 'Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_view_all_destinations',
    title: 'View All Destinations',
    content: 'View All Destinations',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_packages_text',
    title: 'Packages Menu',
    content: 'Travel Packages',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_travel_styles_text',
    title: 'Travel Styles Menu',
    content: 'Travel Styles',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_about_text',
    title: 'About Menu',
    content: 'About',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_contact_text',
    title: 'Contact Menu',
    content: 'Contact',
    section_type: 'hero',
    is_active: true
  },
  {
    section_key: 'nav_request_quote_mobile',
    title: 'Request Quote Mobile',
    content: 'Request Quote',
    section_type: 'hero',
    is_active: true
  },

  // ===== FOOTER CONTENT =====
  {
    section_key: 'footer_company_description',
    title: 'Company Description',
    content: 'Creating extraordinary luxury travel experiences across South America. From Machu Picchu to Patagonia, we craft bespoke journeys that create lasting memories.',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_destinations_title',
    title: 'Destinations Title',
    content: 'Destinations',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_company_title',
    title: 'Company Links Title',
    content: 'Company',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_contact_title',
    title: 'Contact Title',
    content: 'Contact',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_newsletter_title',
    title: 'Newsletter Title',
    content: 'Stay Updated',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_newsletter_description',
    title: 'Newsletter Description',
    content: 'Get travel inspiration and exclusive offers delivered to your inbox',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_newsletter_placeholder',
    title: 'Newsletter Placeholder',
    content: 'Enter your email',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_newsletter_button',
    title: 'Newsletter Button',
    content: 'Subscribe',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_copyright_text',
    title: 'Copyright Text',
    content: '© 2025 Meridian Luxury Travel. All rights reserved.',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_privacy_policy',
    title: 'Privacy Policy',
    content: 'Privacy Policy',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_terms_service',
    title: 'Terms of Service',
    content: 'Terms of Service',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_cookie_policy',
    title: 'Cookie Policy',
    content: 'Cookie Policy',
    section_type: 'footer',
    is_active: true
  },
  {
    section_key: 'footer_accessibility',
    title: 'Accessibility',
    content: 'Accessibility',
    section_type: 'footer',
    is_active: true
  }
];

async function populateAllContent() {
  console.log('🚀 Populating ALL CMS content (Home, About, Contact, Destinations, Navigation, Footer)...\n');
  
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

    // Insert all content sections
    console.log(`Inserting ${contentSections.length} content sections...`);
    
    const { data, error: insertError } = await supabase
      .from('content_sections')
      .insert(contentSections);
    
    if (insertError) {
      console.error('Error inserting content sections:', insertError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${contentSections.length} content sections`);
    
    // Summary by section_type
    const summary = contentSections.reduce((acc, section) => {
      acc[section.section_type] = (acc[section.section_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Content Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} sections`);
    });
    
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
  
  console.log('\n✅ Complete content population finished!');
  console.log('Your CMS admin interface should now show ALL pages fully populated.');
  
  process.exit(0);
}

populateAllContent();