-- Add custom PDF title field to custom_quotes table
ALTER TABLE custom_quotes ADD COLUMN pdf_title TEXT;

-- Add comment for clarity
COMMENT ON COLUMN custom_quotes.pdf_title IS 'Custom title for PDF itinerary (e.g., "Reece''s Awesome Peru Adventure")';