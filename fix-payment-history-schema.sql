-- Fix payment_history table schema by adding missing columns
-- These columns are used by the payment API and webhook

-- Add missing columns to payment_history table
ALTER TABLE payment_history
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES custom_quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS payment_history_quote_id_idx ON payment_history(quote_id);
CREATE INDEX IF NOT EXISTS payment_history_user_id_idx ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS payment_history_stripe_intent_idx ON payment_history(stripe_payment_intent_id);

-- Add missing column for updated_at timestamp (good practice)
ALTER TABLE payment_history
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_history'
AND table_schema = 'public'
ORDER BY ordinal_position;