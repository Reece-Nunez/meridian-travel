-- Migration: Add draft/published status to content_sections table
-- Run this in your Supabase SQL editor

-- Add status column to content_sections
ALTER TABLE content_sections
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' NOT NULL;

-- Add draft_content column to store unpublished changes
ALTER TABLE content_sections
ADD COLUMN IF NOT EXISTS draft_content TEXT;

-- Add published_at timestamp
ALTER TABLE content_sections
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update existing rows to have published status and set published_at
UPDATE content_sections
SET status = 'published',
    published_at = updated_at
WHERE status IS NULL OR status = '';

-- Create an index for faster status queries
CREATE INDEX IF NOT EXISTS idx_content_sections_status ON content_sections(status);

-- Add a comment explaining the status field
COMMENT ON COLUMN content_sections.status IS 'Content status: draft or published';
COMMENT ON COLUMN content_sections.draft_content IS 'Stores draft version of content before publishing';
COMMENT ON COLUMN content_sections.published_at IS 'Timestamp when content was last published';
