-- Complete Website Content Population Script
-- This script populates ALL text content from your website into the CMS
-- Run this in your Supabase SQL editor

-- Home Page Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('hero_title', 'Hero Title', 'Discover the Magic of South America', 'home', true),
('hero_subtitle', 'Hero Subtitle', 'From Machu Picchu to Patagonia, explore South America''s rich heritage and stunning landscapes with curated luxury adventures designed just for you.', 'home', true),
('hero_cta', 'Hero CTA Button', 'Explore Destinations', 'home', true),
('hero_cta_secondary', 'Hero Secondary CTA', 'Plan Your Journey', 'home', true),
('about_title', 'About Title', 'Why Choose Meridian Luxury Travel?', 'home', true),
('about_content', 'About Content', 'We create personalized luxury adventures that go beyond typical tourist experiences.', 'home', true),
('feature_1_title', 'Feature 1 Title', 'Expert Local Knowledge', 'home', true),
('feature_1_content', 'Feature 1 Content', 'Our Peru specialists have personally explored every destination we offer, ensuring authentic and meaningful experiences.', 'home', true),
('feature_2_title', 'Feature 2 Title', 'Tailored Experiences', 'home', true),
('feature_2_content', 'Feature 2 Content', 'Every journey is carefully crafted around your interests, travel style, and budget for a truly personal adventure.', 'home', true),
('feature_3_title', 'Feature 3 Title', '24/7 Support', 'home', true),
('feature_3_content', 'Feature 3 Content', 'From planning to your safe return home, our dedicated team provides round-the-clock support for peace of mind.', 'home', true),
('featured_destinations_title', 'Featured Destinations Title', 'Featured Destinations', 'home', true),
('featured_destinations_subtitle', 'Featured Destinations Subtitle', 'From ancient ruins to natural wonders, discover Peru''s most captivating destinations.', 'home', true),
('destination_1_title', 'Destination 1 Title', 'Machu Picchu', 'home', true),
('destination_1_content', 'Destination 1 Content', 'Explore the mystical ancient citadel and marvel at Incan engineering prowess.', 'home', true),
('destination_2_title', 'Destination 2 Title', 'Amazon Rainforest', 'home', true),
('destination_2_content', 'Destination 2 Content', 'Immerse yourself in the world''s most biodiverse ecosystem with expert naturalist guides.', 'home', true),
('destination_3_title', 'Destination 3 Title', 'Sacred Valley', 'home', true),
('destination_3_content', 'Destination 3 Content', 'Experience authentic Andean culture and visit traditional markets and villages.', 'home', true),
('cta_title', 'CTA Title', 'Ready to Begin Your Peru Adventure?', 'home', true),
('cta_subtitle', 'CTA Subtitle', 'Let our Peru experts create a personalized itinerary tailored to your dreams and interests.', 'home', true),
('cta_button', 'CTA Button', 'Request Your Custom Quote', 'home', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- About Page Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('about_page_title', 'Page Title', 'About Meridian Luxury Travel', 'about', true),
('about_story_title', 'Story Title', 'Our Story', 'about', true),
('about_story_content', 'Story Content', 'Whether it''s embarking on a private yacht excursion in the Galápagos, watching the sunrise over Machu Picchu, traveling aboard the legendary Hiram Bingham train, or enjoying exclusive access to historic landmarks closed to the public, each journey is designed with meticulous attention to detail. We believe true luxury lies in the combination of iconic destinations and insider access. That means staying in hand-selected accommodations that reflect both elegance and authenticity, traveling with expert local guides who open doors few others can, and enjoying seamless logistics that ensure every step feels effortless. Our mission is simple: to transform travel into curated experiences that elevate exploration into something truly extraordinary. With Meridian Luxury Travel, you don''t just see the world; you live its most unforgettable stories.', 'about', true),
('about_services_title', 'Services Title', 'Our Services', 'about', true),
('about_services_content', 'Services Content', 'At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury.', 'about', true),
('about_commitment_title', 'Commitment Title', 'Our Commitment to You', 'about', true),
('about_commitment_content', 'Commitment Content', 'At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury. Your dreams become our mission. Your adventure becomes our passion. Let us show you why Meridian Luxury Travel will become one of the most meaningful travel experiences of your life.', 'about', true),
('about_commitment_cta', 'Commitment CTA', 'Start Planning Your Peru Adventure', 'about', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Contact Page Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('contact_page_title', 'Page Title', 'Contact Us', 'contact', true),
('contact_page_subtitle', 'Page Subtitle', 'Ready to begin your Peru adventure? Our travel specialists are here to help you plan the perfect journey.', 'contact', true),
('contact_section_title', 'Section Title', 'Get in Touch', 'contact', true),
('contact_phone', 'Phone Number', '+1 (555) 012-3456', 'contact', true),
('contact_phone_hours', 'Phone Hours', 'Monday - Friday: 9:00 AM - 6:00 PM EST
Saturday: 10:00 AM - 4:00 PM EST', 'contact', true),
('contact_email', 'Email Address', 'info@meridiantravel.com', 'contact', true),
('contact_email_response', 'Email Response Time', 'We respond to all inquiries within 24 hours', 'contact', true),
('contact_address', 'Office Address', '123 Travel Avenue
Adventure City, AC 12345
United States', 'contact', true),
('contact_emergency_phone', 'Emergency Phone', '+1 (555) 019-9999', 'contact', true),
('contact_emergency_text', 'Emergency Text', '24/7 emergency support for travelers', 'contact', true),
('contact_quick_action_title', 'Quick Action Title', 'Ready to Start Planning?', 'contact', true),
('contact_quick_action_content', 'Quick Action Content', 'The fastest way to get your custom Peru itinerary is to request a quote online. Our specialists will contact you within 24 hours.', 'contact', true),
('contact_quick_action_button', 'Quick Action Button', 'Request Your Quote', 'contact', true),
('contact_faq_title', 'FAQ Title', 'Frequently Asked Questions', 'contact', true),
('contact_faq_1_question', 'FAQ 1 Question', 'How far in advance should I book my Peru trip?', 'contact', true),
('contact_faq_1_answer', 'FAQ 1 Answer', 'We recommend booking at least 3-6 months in advance, especially for travel during peak season (May-September). Popular experiences like the Inca Trail require permits that sell out quickly, so earlier booking ensures better availability.', 'contact', true),
('contact_faq_2_question', 'FAQ 2 Question', 'What''s included in your Peru travel packages?', 'contact', true),
('contact_faq_2_answer', 'FAQ 2 Answer', 'Our packages typically include accommodations, transportation, guided tours, entrance fees, and most meals. Each itinerary is custom-built, so inclusions vary based on your preferences and budget. We''ll provide a detailed breakdown when we send your quote.', 'contact', true),
('contact_faq_3_question', 'FAQ 3 Question', 'Do you provide travel insurance recommendations?', 'contact', true),
('contact_faq_3_answer', 'FAQ 3 Answer', 'Yes, we strongly recommend travel insurance for all Peru trips. We can provide recommendations for reputable insurance providers that offer coverage for adventure activities and high-altitude destinations.', 'contact', true),
('contact_faq_4_question', 'FAQ 4 Question', 'What if I need to change my travel dates?', 'contact', true),
('contact_faq_4_answer', 'FAQ 4 Answer', 'We understand that plans can change. Depending on how far in advance you notify us and the specific services booked, we''ll work with our partners to minimize any change fees. Our team will guide you through the process.', 'contact', true),
('contact_faq_5_question', 'FAQ 5 Question', 'Do you offer group discounts?', 'contact', true),
('contact_faq_5_answer', 'FAQ 5 Answer', 'Yes! We offer competitive pricing for groups of 8 or more travelers. Group travel also allows for more customization options and can include private guides and exclusive experiences.', 'contact', true),
('contact_faq_6_question', 'FAQ 6 Question', 'What support do you provide during my trip?', 'contact', true),
('contact_faq_6_answer', 'FAQ 6 Answer', 'You''ll have access to our 24/7 emergency support line throughout your journey. We also provide detailed pre-departure information and can assist with any issues that arise during your trip.', 'contact', true),
('contact_cta_title', 'CTA Title', 'Still Have Questions?', 'contact', true),
('contact_cta_subtitle', 'CTA Subtitle', 'Our Peru travel specialists are here to help. Don''t hesitate to reach out—we love talking about Peru adventures!', 'contact', true),
('contact_cta_button_1', 'CTA Button 1', 'Call Us Now', 'contact', true),
('contact_cta_button_2', 'CTA Button 2', 'Send an Email', 'contact', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Destinations Page Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('destinations_page_title', 'Page Title', 'Our Destinations', 'destinations', true),
('destinations_page_subtitle', 'Page Subtitle', 'Explore the diverse landscapes and rich cultures of South America with our expert-guided luxury tours', 'destinations', true),
('destinations_available_title', 'Available Title', 'Available Now', 'destinations', true),
('destinations_available_subtitle', 'Available Subtitle', 'Start your South American adventure with our currently available destinations', 'destinations', true),
('destinations_coming_title', 'Coming Soon Title', 'Coming Soon', 'destinations', true),
('destinations_coming_subtitle', 'Coming Soon Subtitle', 'We''re expanding our destinations to bring you even more incredible South American experiences', 'destinations', true),
('destinations_cta_title', 'CTA Title', 'Ready to Start Your South American Adventure?', 'destinations', true),
('destinations_cta_subtitle', 'CTA Subtitle', 'Whether you''re interested in our available destinations or excited about our upcoming locations, our travel specialists are here to help you plan the perfect journey.', 'destinations', true),
('destinations_cta_button_1', 'CTA Button 1', 'Browse Trip Packages', 'destinations', true),
('destinations_cta_button_2', 'CTA Button 2', 'Request Custom Quote', 'destinations', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Navigation & Global Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('nav_company_name', 'Company Name', 'Meridian Luxury Travel', 'global', true),
('nav_company_tagline', 'Company Tagline', 'Tailor-Made Journeys', 'global', true),
('nav_login_text', 'Login Text', 'Login', 'global', true),
('nav_get_quote_text', 'Get Quote Text', 'Get Quote', 'global', true),
('nav_dashboard_text', 'Dashboard Text', 'Dashboard', 'global', true),
('nav_profile_text', 'Profile Text', 'Profile', 'global', true),
('nav_sign_out_text', 'Sign Out Text', 'Sign Out', 'global', true),
('nav_destinations_text', 'Destinations Menu', 'Destinations', 'global', true),
('nav_view_all_destinations', 'View All Destinations', 'View All Destinations', 'global', true),
('nav_packages_text', 'Packages Menu', 'Packages', 'global', true),
('nav_travel_styles_text', 'Travel Styles Menu', 'Travel Styles', 'global', true),
('nav_about_text', 'About Menu', 'About', 'global', true),
('nav_contact_text', 'Contact Menu', 'Contact', 'global', true),
('nav_request_quote_mobile', 'Request Quote Mobile', 'Request Quote', 'global', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Footer Content
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('footer_company_description', 'Company Description', 'Your trusted South American travel specialists, dedicated to creating extraordinary luxury adventures that connect you with the heart of this remarkable continent.', 'footer', true),
('footer_destinations_title', 'Destinations Title', 'Destinations', 'footer', true),
('footer_company_title', 'Company Links Title', 'Company', 'footer', true),
('footer_contact_title', 'Contact Title', 'Contact', 'footer', true),
('footer_newsletter_title', 'Newsletter Title', 'Stay Inspired', 'footer', true),
('footer_newsletter_description', 'Newsletter Description', 'Get exclusive travel insights, destination guides, and special offers delivered to your inbox.', 'footer', true),
('footer_newsletter_placeholder', 'Newsletter Placeholder', 'Enter your email', 'footer', true),
('footer_newsletter_button', 'Newsletter Button', 'Subscribe', 'footer', true),
('footer_copyright_text', 'Copyright Text', 'Meridian Luxury Travel. All rights reserved.', 'footer', true),
('footer_privacy_policy', 'Privacy Policy', 'Privacy Policy', 'footer', true),
('footer_terms_service', 'Terms of Service', 'Terms of Service', 'footer', true),
('footer_cookie_policy', 'Cookie Policy', 'Cookie Policy', 'footer', true),
('footer_accessibility', 'Accessibility', 'Accessibility', 'footer', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Status labels and UI text
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('destinations_available_now', 'Available Now Badge', 'Available Now', 'destinations', true),
('destinations_coming_soon', 'Coming Soon Badge', 'Coming Soon', 'destinations', true),
('destinations_launching_year', 'Launching Year', 'Launching 2025', 'destinations', true),
('destinations_explore_button', 'Explore Button Template', 'Explore {destination}', 'destinations', true),
('destinations_view_packages', 'View Packages Button', 'View Packages', 'destinations', true),
('destinations_highlights_title', 'Highlights Title', 'Highlights:', 'destinations', true),
('destinations_coming_highlights', 'Coming Highlights Title', 'Coming Highlights:', 'destinations', true),
('destinations_best_time', 'Best Time Label', 'Best Time:', 'destinations', true),
('destinations_duration', 'Duration Label', 'Duration:', 'destinations', true),
('destinations_more_experiences', 'More Experiences Text', '+{count} more experiences', 'destinations', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Additional About Page service cards (from the hardcoded content)
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('about_bespoke_title', 'Bespoke Itineraries Title', 'Bespoke Itineraries', 'about', true),
('about_bespoke_content', 'Bespoke Itineraries Content', 'Customized trips designed around your passions and schedule. Every journey is crafted to reflect your unique interests and travel dreams.', 'about', true),
('about_accommodations_title', 'Exclusive Accommodations Title', 'Exclusive Accommodations', 'about', true),
('about_accommodations_content', 'Exclusive Accommodations Content', 'Hand-picked 5-star resorts, boutique hideaways, and luxury villas that reflect both elegance and authenticity.', 'about', true),
('about_experiences_title', 'Private Experiences Title', 'Private Experiences', 'about', true),
('about_experiences_content', 'Private Experiences Content', 'From cooking with Michelin-starred chefs to after-hours museum tours, exclusive access to experiences few others can provide.', 'about', true),
('about_logistics_title', 'Seamless Logistics Title', 'Seamless Logistics', 'about', true),
('about_logistics_content', 'Seamless Logistics Content', 'Private transfers, first-class rail, chartered yachts, and concierge service to ensure every step feels effortless.', 'about', true),
('about_specialization_title', 'Specialization Title', 'Luxury Travel Specialists Since Day One', 'about', true),
('about_specialization_content', 'Specialization Content', 'While other travel companies try to cover the entire world, we''ve chosen to focus exclusively on Peru and the surrounding regions. This specialization allows us to offer unparalleled expertise and insider access to experiences that other travelers simply can''t find. Our team has personally explored every destination we recommend, from the ancient citadels of the Sacred Valley to the remote tributaries of the Amazon rainforest. We know the best local guides, the most authentic experiences, and the hidden gems that make Peru truly magical.', 'about', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Footer contact information
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('footer_phone', 'Footer Phone', '+1 (555) 012-3456', 'footer', true),
('footer_phone_hours', 'Footer Phone Hours', 'Mon-Fri: 9AM-6PM EST', 'footer', true),
('footer_email', 'Footer Email', 'info@meridianluxurytravel.com', 'footer', true),
('footer_address', 'Footer Address', '123 Travel Avenue
Adventure City, AC 12345
United States', 'footer', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Select all content to see the results
SELECT 
  section_type, 
  COUNT(*) as section_count
FROM content_sections 
GROUP BY section_type 
ORDER BY section_type;