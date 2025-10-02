-- Add pricing fields to trip_packages if they don't exist
-- This migration is idempotent and safe to run multiple times

DO $$
BEGIN
    -- Add price_usd if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trip_packages' AND column_name = 'price_usd'
    ) THEN
        ALTER TABLE trip_packages ADD COLUMN price_usd DECIMAL(10,2);
    END IF;

    -- Add price_eur if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trip_packages' AND column_name = 'price_eur'
    ) THEN
        ALTER TABLE trip_packages ADD COLUMN price_eur DECIMAL(10,2);
    END IF;

    -- Add price_gbp if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trip_packages' AND column_name = 'price_gbp'
    ) THEN
        ALTER TABLE trip_packages ADD COLUMN price_gbp DECIMAL(10,2);
    END IF;
END $$;
