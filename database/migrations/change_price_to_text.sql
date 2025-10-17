-- Change price_usd from numeric to text to allow flexible pricing like "Starting at $100"
-- This allows the client to show estimated/starting prices that can vary

-- First, convert existing numeric prices to text with "Starting at $X" format
ALTER TABLE trip_packages 
  ALTER COLUMN price_usd TYPE text 
  USING CASE 
    WHEN price_usd IS NOT NULL AND price_usd > 0 
    THEN 'Starting at $' || CAST(price_usd AS text)
    ELSE NULL 
  END;

-- Add a comment explaining the field
COMMENT ON COLUMN trip_packages.price_usd IS 'Flexible pricing text (e.g., "Starting at $100", "From $875 per person"). Actual prices may vary and are finalized in quote.';
