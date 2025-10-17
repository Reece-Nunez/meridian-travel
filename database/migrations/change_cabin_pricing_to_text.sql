-- Change pricing_per_person from numeric to text to allow flexible pricing
-- This allows the client to show estimated/starting prices for cabins that can vary

-- Convert existing numeric prices to text with "Starting at $X" format
ALTER TABLE cabin_categories
  ALTER COLUMN pricing_per_person TYPE text
  USING CASE
    WHEN pricing_per_person IS NOT NULL AND pricing_per_person > 0
    THEN 'Starting at $' || CAST(pricing_per_person AS text)
    ELSE NULL
  END;

-- Add a comment explaining the field
COMMENT ON COLUMN cabin_categories.pricing_per_person IS 'Flexible pricing text (e.g., "Starting at $1500", "From $2000 per person"). Actual prices may vary and are finalized in quote.';
