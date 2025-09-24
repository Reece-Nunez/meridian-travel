-- Add versioning and payment validation to custom_quotes table
ALTER TABLE custom_quotes
ADD COLUMN quote_version INTEGER DEFAULT 1,
ADD COLUMN last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add payment_method column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_quotes' AND column_name = 'payment_method') THEN
        ALTER TABLE custom_quotes ADD COLUMN payment_method TEXT CHECK (payment_method IN ('stripe', 'ach', 'check')) DEFAULT 'stripe';
    END IF;
END $$;

-- Create function to increment version when price changes
CREATE OR REPLACE FUNCTION increment_quote_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if quoted_price has changed
    IF OLD.quoted_price IS DISTINCT FROM NEW.quoted_price THEN
        NEW.quote_version = COALESCE(OLD.quote_version, 1) + 1;
        NEW.last_price_update = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment version on price updates
DROP TRIGGER IF EXISTS quote_version_trigger ON custom_quotes;
CREATE TRIGGER quote_version_trigger
    BEFORE UPDATE ON custom_quotes
    FOR EACH ROW
    EXECUTE FUNCTION increment_quote_version();

-- Add quote_version to payment_history for tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_history' AND column_name = 'quote_version') THEN
        ALTER TABLE payment_history ADD COLUMN quote_version INTEGER;
    END IF;
END $$;