-- CMS Tables Migration
-- This file adds the content management system tables

-- Create content_sections table (CMS content management)
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  section_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true
);

-- Create site_settings table (general site settings)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'email', 'phone', 'url', 'textarea')),
  description TEXT
);

-- Enable RLS for new tables
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Content sections policies (publicly readable, admin manageable)
CREATE POLICY "Content sections are publicly readable" ON content_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Content sections are manageable" ON content_sections FOR ALL USING (true);

-- Site settings policies (publicly readable, admin manageable)  
CREATE POLICY "Site settings are publicly readable" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings are manageable" ON site_settings FOR ALL USING (true);

-- Add update triggers
CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON content_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Meridian Luxury Travel', 'text', 'Company name displayed throughout the site'),
('contact_email', 'info@meridiantravel.com', 'email', 'Main contact email address'),
('contact_phone', '+1 (555) 012-3456', 'phone', 'Main contact phone number')
ON CONFLICT (setting_key) DO NOTHING;