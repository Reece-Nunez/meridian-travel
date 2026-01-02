-- Add original_image_url column to page_hero_settings table
-- This stores the uncropped original image for use on mobile devices

ALTER TABLE page_hero_settings
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN page_hero_settings.original_image_url IS 'Original uncropped image URL for responsive mobile display';
