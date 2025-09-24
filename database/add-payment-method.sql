-- Add payment_method column to custom_quotes table
ALTER TABLE custom_quotes
ADD COLUMN payment_method TEXT
CHECK (payment_method IN ('stripe', 'ach', 'check'))
DEFAULT 'stripe';

-- Update existing quotes to have stripe as default
UPDATE custom_quotes SET payment_method = 'stripe' WHERE payment_method IS NULL;