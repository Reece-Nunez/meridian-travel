-- Populate content_sections table with existing website content
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
('about_services_content', 'Services Content', 'At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury.', 'about', true)

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

-- Destinations Page Content (basic structure)
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('destinations_page_title', 'Page Title', 'Our Destinations', 'destinations', true),
('destinations_page_subtitle', 'Page Subtitle', 'Explore our carefully curated selection of South American destinations.', 'destinations', true),
('destinations_available_title', 'Available Title', 'Available Destinations', 'destinations', true),
('destinations_available_subtitle', 'Available Subtitle', 'Ready to explore these incredible destinations.', 'destinations', true),
('destinations_coming_title', 'Coming Soon Title', 'Coming Soon', 'destinations', true),
('destinations_coming_subtitle', 'Coming Soon Subtitle', 'New destinations we''re adding to our portfolio.', 'destinations', true),
('destinations_cta_title', 'CTA Title', 'Ready to Explore?', 'destinations', true),
('destinations_cta_subtitle', 'CTA Subtitle', 'Let us help you plan your perfect South American adventure.', 'destinations', true)

ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();