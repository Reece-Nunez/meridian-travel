-- Create page_hero_settings table for storing hero image settings per page
CREATE TABLE IF NOT EXISTS page_hero_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'quote', 'packages', 'cruises', 'about'
  page_name VARCHAR(255) NOT NULL,          -- Human-readable name e.g., 'Quote Request Page'
  hero_image_url TEXT,                       -- URL to the hero image
  focal_point_x DECIMAL(5,2) DEFAULT 50,    -- Horizontal focal point (0-100%)
  focal_point_y DECIMAL(5,2) DEFAULT 50,    -- Vertical focal point (0-100%)
  hero_height_mobile VARCHAR(20) DEFAULT '400px',  -- CSS height for mobile
  hero_height_desktop VARCHAR(20) DEFAULT '500px', -- CSS height for desktop
  overlay_opacity DECIMAL(3,2) DEFAULT 0.50,       -- Dark overlay opacity (0-1)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_page_hero_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_hero_settings_updated_at
  BEFORE UPDATE ON page_hero_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_page_hero_settings_updated_at();

-- Enable RLS
ALTER TABLE page_hero_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (for frontend)
CREATE POLICY "Anyone can view page hero settings"
  ON page_hero_settings
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage page hero settings"
  ON page_hero_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default settings for existing pages
INSERT INTO page_hero_settings (page_slug, page_name, hero_image_url, focal_point_x, focal_point_y) VALUES
  ('quote', 'Quote Request', 'https://meridian-travel.s3.us-east-1.amazonaws.com/quote.webp', 50, 40),
  ('packages', 'Trip Packages', 'https://meridian-travel.s3.us-east-1.amazonaws.com/packages-hero.webp', 50, 50),
  ('cruises', 'Cruises', 'https://meridian-travel.s3.us-east-1.amazonaws.com/cruise-ship.webp', 50, 30),
  ('about', 'About Us', 'https://meridian-travel.s3.us-east-1.amazonaws.com/about-hero.webp', 50, 50),
  ('contact', 'Contact Us', 'https://meridian-travel.s3.us-east-1.amazonaws.com/contact-hero.webp', 50, 50)
ON CONFLICT (page_slug) DO NOTHING;
