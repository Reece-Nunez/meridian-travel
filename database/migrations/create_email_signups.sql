-- Create email_signups table for storing newsletter signups
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'coming_soon_page',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);

-- Create index on subscribed_at for sorting
CREATE INDEX IF NOT EXISTS idx_email_signups_subscribed_at ON email_signups(subscribed_at DESC);

-- Add RLS policies
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for the signup form)
CREATE POLICY "Allow public email signups"
  ON email_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to view all signups
CREATE POLICY "Allow admins to view email signups"
  ON email_signups
  FOR SELECT
  TO authenticated
  USING (true);
