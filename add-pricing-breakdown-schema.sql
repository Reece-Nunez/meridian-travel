-- Add pricing breakdown columns to custom_quotes table
ALTER TABLE custom_quotes
ADD COLUMN IF NOT EXISTS adult_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS child_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS adult_count INTEGER,
ADD COLUMN IF NOT EXISTS child_count INTEGER,
ADD COLUMN IF NOT EXISTS inclusions TEXT[],
ADD COLUMN IF NOT EXISTS exclusions TEXT[];

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS custom_quotes_pricing_idx ON custom_quotes(adult_price, child_price);

-- Add updated_at trigger to track changes
CREATE OR REPLACE FUNCTION update_custom_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS custom_quotes_updated_at_trigger ON custom_quotes;
CREATE TRIGGER custom_quotes_updated_at_trigger
    BEFORE UPDATE ON custom_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_quotes_updated_at();

-- Verify the new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_quotes'
AND table_schema = 'public'
AND column_name IN ('adult_price', 'child_price', 'adult_count', 'child_count', 'inclusions', 'exclusions')
ORDER BY ordinal_position;