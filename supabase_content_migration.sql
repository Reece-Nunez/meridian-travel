-- Content Management Tables for Meridian Travel
-- Run this script in your Supabase SQL Editor

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  section_key VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  section_type VARCHAR(50) CHECK (section_type IN ('hero', 'about', 'services', 'contact', 'footer')) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) CHECK (setting_type IN ('text', 'email', 'phone', 'url', 'textarea')) NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- Insert default content sections
INSERT INTO content_sections (section_key, title, content, section_type, is_active) VALUES
('hero_title', 'Hero Title', 'Discover Extraordinary Adventures', 'hero', true),
('hero_subtitle', 'Hero Subtitle', 'Embark on carefully curated luxury travel experiences that create lasting memories.', 'hero', true),
('hero_cta', 'Hero Call to Action', 'Start Your Journey', 'hero', true),
('about_title', 'About Us Title', 'About Meridian Luxury Travel', 'about', true),
('about_content', 'About Us Content', 'We specialize in creating bespoke travel experiences that exceed expectations. Our team of travel experts carefully crafts each journey to ensure unforgettable adventures that create lasting memories.', 'about', true),
('services_title', 'Services Title', 'Our Services', 'services', true),
('services_content', 'Services Content', 'From luxury accommodations to unique experiences, we handle every detail of your travel adventure.', 'services', true),
('contact_title', 'Contact Title', 'Get in Touch', 'contact', true),
('contact_content', 'Contact Content', 'Ready to plan your next adventure? Contact us today to start creating your perfect travel experience.', 'contact', true),
('footer_tagline', 'Footer Tagline', 'Creating extraordinary travel experiences since 2024.', 'footer', true)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Meridian Luxury Travel', 'text', 'Company Name'),
('contact_email', 'chris@meridianluxury.travel', 'email', 'Main Contact Email'),
('contact_phone', '+1 (555) 123-4567', 'phone', 'Main Contact Phone'),
('website_url', 'https://www.meridianluxury.travel', 'url', 'Website URL'),
('company_address', '123 Travel Way, Adventure City, AC 12345', 'textarea', 'Company Address'),
('business_hours', 'Monday - Friday: 9:00 AM - 6:00 PM EST', 'text', 'Business Hours'),
('tagline', 'Creating extraordinary travel experiences', 'text', 'Company Tagline'),
('emergency_contact', '+1 (555) 911-HELP', 'phone', '24/7 Emergency Contact'),
('social_facebook', 'https://facebook.com/meridianluxury', 'url', 'Facebook URL'),
('social_instagram', 'https://instagram.com/meridianluxury', 'url', 'Instagram URL'),
('booking_terms', 'Standard booking terms and conditions apply. See our website for full details.', 'textarea', 'Booking Terms'),
('cancellation_policy', '24-hour cancellation policy. Please contact us for specific trip cancellation terms.', 'textarea', 'Cancellation Policy')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow full access for now, you can restrict later)
CREATE POLICY "Allow all operations on content_sections" ON content_sections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on site_settings" ON site_settings  
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_sections_section_type ON content_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_content_sections_active ON content_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);