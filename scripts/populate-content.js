const { createClient } = require('@supabase/supabase-js');

// Hardcode these for now - replace with your actual values
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'your-service-role-key'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseKey);

const contentSections = [
  // Home Page Content
  {
    section_key: 'hero_title',
    title: 'Hero Title',
    content: 'Discover the Magic of South America',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'hero_subtitle',
    title: 'Hero Subtitle',
    content: 'From Machu Picchu to Patagonia, explore South America\'s rich heritage and stunning landscapes with curated luxury adventures designed just for you.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'hero_cta',
    title: 'Hero CTA Button',
    content: 'Explore Destinations',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'hero_cta_secondary',
    title: 'Hero Secondary CTA',
    content: 'Plan Your Journey',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'about_title',
    title: 'About Title',
    content: 'Why Choose Meridian Luxury Travel?',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'about_content',
    title: 'About Content',
    content: 'We create personalized luxury adventures that go beyond typical tourist experiences.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_1_title',
    title: 'Feature 1 Title',
    content: 'Expert Local Knowledge',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_1_content',
    title: 'Feature 1 Content',
    content: 'Our Peru specialists have personally explored every destination we offer, ensuring authentic and meaningful experiences.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_2_title',
    title: 'Feature 2 Title',
    content: 'Tailored Experiences',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_2_content',
    title: 'Feature 2 Content',
    content: 'Every journey is carefully crafted around your interests, travel style, and budget for a truly personal adventure.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_3_title',
    title: 'Feature 3 Title',
    content: '24/7 Support',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'feature_3_content',
    title: 'Feature 3 Content',
    content: 'From planning to your safe return home, our dedicated team provides round-the-clock support for peace of mind.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'featured_destinations_title',
    title: 'Featured Destinations Title',
    content: 'Featured Destinations',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'featured_destinations_subtitle',
    title: 'Featured Destinations Subtitle',
    content: 'From ancient ruins to natural wonders, discover Peru\'s most captivating destinations.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_1_title',
    title: 'Destination 1 Title',
    content: 'Machu Picchu',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_1_content',
    title: 'Destination 1 Content',
    content: 'Explore the mystical ancient citadel and marvel at Incan engineering prowess.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_2_title',
    title: 'Destination 2 Title',
    content: 'Amazon Rainforest',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_2_content',
    title: 'Destination 2 Content',
    content: 'Immerse yourself in the world\'s most biodiverse ecosystem with expert naturalist guides.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_3_title',
    title: 'Destination 3 Title',
    content: 'Sacred Valley',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'destination_3_content',
    title: 'Destination 3 Content',
    content: 'Experience authentic Andean culture and visit traditional markets and villages.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'cta_title',
    title: 'CTA Title',
    content: 'Ready to Begin Your Peru Adventure?',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'cta_subtitle',
    title: 'CTA Subtitle',
    content: 'Let our Peru experts create a personalized itinerary tailored to your dreams and interests.',
    section_type: 'home',
    is_active: true
  },
  {
    section_key: 'cta_button',
    title: 'CTA Button',
    content: 'Request Your Custom Quote',
    section_type: 'home',
    is_active: true
  },

  // About Page Content
  {
    section_key: 'about_page_title',
    title: 'Page Title',
    content: 'About Meridian Luxury Travel',
    section_type: 'about',
    is_active: true
  },
  {
    section_key: 'about_content',
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
    content: 'Whether it\'s embarking on a private yacht excursion in the Galápagos, watching the sunrise over Machu Picchu, traveling aboard the legendary Hiram Bingham train, or enjoying exclusive access to historic landmarks closed to the public, each journey is designed with meticulous attention to detail. We believe true luxury lies in the combination of iconic destinations and insider access. That means staying in hand-selected accommodations that reflect both elegance and authenticity, traveling with expert local guides who open doors few others can, and enjoying seamless logistics that ensure every step feels effortless. Our mission is simple: to transform travel into curated experiences that elevate exploration into something truly extraordinary. With Meridian Luxury Travel, you don\'t just see the world; you live its most unforgettable stories.',
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

  // Contact Page Content
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
    content: 'Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST',
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
    content: '123 Travel Avenue\nAdventure City, AC 12345\nUnited States',
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
  }
];

async function populateContent() {
  console.log('Starting content population...');
  
  try {
    // First, let's check what already exists
    const { data: existingContent } = await supabase
      .from('content_sections')
      .select('section_key');
    
    const existingKeys = new Set(existingContent?.map(item => item.section_key) || []);
    
    // Filter out content that already exists
    const newContent = contentSections.filter(item => !existingKeys.has(item.section_key));
    
    console.log(`Found ${existingKeys.size} existing content sections`);
    console.log(`Will insert ${newContent.length} new content sections`);
    
    if (newContent.length > 0) {
      const { data, error } = await supabase
        .from('content_sections')
        .insert(newContent)
        .select();

      if (error) {
        console.error('Error inserting content:', error);
        return;
      }

      console.log(`Successfully inserted ${data.length} content sections`);
    } else {
      console.log('No new content to insert');
    }
    
    // Show a summary of all content
    const { data: allContent } = await supabase
      .from('content_sections')
      .select('*')
      .order('section_type, section_key');
    
    const contentByType = {};
    allContent?.forEach(item => {
      if (!contentByType[item.section_type]) {
        contentByType[item.section_type] = [];
      }
      contentByType[item.section_type].push(item.section_key);
    });
    
    console.log('\nContent summary by page:');
    Object.entries(contentByType).forEach(([type, keys]) => {
      console.log(`  ${type}: ${keys.length} sections`);
    });
    
    console.log('\nContent population complete!');
    
  } catch (error) {
    console.error('Error in populateContent:', error);
  }
}

populateContent();