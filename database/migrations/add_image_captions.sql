-- Add image metadata fields to ships table to support captions
-- This migration converts simple image URLs to structured data with captions

DO $$
BEGIN
    -- Add new JSONB column for image metadata (url + caption)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ships' AND column_name = 'image_metadata'
    ) THEN
        ALTER TABLE ships ADD COLUMN image_metadata JSONB;

        -- Migrate existing images to new format
        UPDATE ships
        SET image_metadata = (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'url', img,
                    'caption', ''
                )
            )
            FROM unnest(images) AS img
        )
        WHERE images IS NOT NULL AND array_length(images, 1) > 0;

        RAISE NOTICE 'Added image_metadata column and migrated existing images';
    END IF;

    -- Add deck plan metadata column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ships' AND column_name = 'deck_plan_metadata'
    ) THEN
        ALTER TABLE ships ADD COLUMN deck_plan_metadata JSONB;

        -- Migrate existing deck plans to new format
        UPDATE ships
        SET deck_plan_metadata = (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'url', dp,
                    'caption', ''
                )
            )
            FROM unnest(deck_plans) AS dp
        )
        WHERE deck_plans IS NOT NULL AND array_length(deck_plans, 1) > 0;

        RAISE NOTICE 'Added deck_plan_metadata column and migrated existing deck plans';
    END IF;
END $$;

-- Note: The old 'images' and 'deck_plans' columns are kept for backward compatibility
-- They will be populated automatically from the metadata columns
