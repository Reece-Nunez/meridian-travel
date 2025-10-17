-- Create cabin_images table for storing cabin images with captions
-- This replaces the simple images TEXT[] array in cabin_categories with a proper relational structure

CREATE TABLE IF NOT EXISTS cabin_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Foreign key to cabin category
    cabin_id UUID NOT NULL REFERENCES cabin_categories(id) ON DELETE CASCADE,

    -- Image details
    image_url TEXT NOT NULL,
    caption TEXT, -- Description/caption for the image
    display_order INTEGER DEFAULT 0 -- Order to display images
);

-- Add RLS policies
ALTER TABLE cabin_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cabin images
CREATE POLICY "Anyone can view cabin images" ON cabin_images
    FOR SELECT USING (true);

-- Policy: Only authenticated users can manage cabin images (admin functionality)
CREATE POLICY "Authenticated users can manage cabin images" ON cabin_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_cabin_images_updated_at BEFORE UPDATE ON cabin_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster cabin lookups
CREATE INDEX idx_cabin_images_cabin_id ON cabin_images(cabin_id);
CREATE INDEX idx_cabin_images_display_order ON cabin_images(cabin_id, display_order);

COMMENT ON TABLE cabin_images IS 'Images with captions for cabin categories';
COMMENT ON COLUMN cabin_images.image_url IS 'Public URL of the cabin image';
COMMENT ON COLUMN cabin_images.caption IS 'Caption or description for the image';
COMMENT ON COLUMN cabin_images.display_order IS 'Order in which images should be displayed (0 = first)';

-- Migrate existing data from cabin_categories.images to cabin_images table
-- This script will convert the TEXT[] array to individual rows
DO $$
DECLARE
    cabin_record RECORD;
    img_url TEXT;
    img_index INTEGER;
BEGIN
    -- Loop through all cabin categories that have images
    FOR cabin_record IN
        SELECT id, images
        FROM cabin_categories
        WHERE images IS NOT NULL AND array_length(images, 1) > 0
    LOOP
        -- Loop through each image URL in the array
        img_index := 0;
        FOREACH img_url IN ARRAY cabin_record.images
        LOOP
            -- Insert each image as a row in cabin_images
            INSERT INTO cabin_images (cabin_id, image_url, caption, display_order)
            VALUES (cabin_record.id, img_url, NULL, img_index);

            img_index := img_index + 1;
        END LOOP;
    END LOOP;
END $$;

-- NOTE: The images column in cabin_categories is kept for backward compatibility
-- but should no longer be used. Future versions can remove this column after
-- confirming all admin pages are updated to use cabin_images table.
