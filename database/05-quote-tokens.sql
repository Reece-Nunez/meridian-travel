-- Quote tokens for secure account linking
CREATE TABLE IF NOT EXISTS quote_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  quote_id UUID REFERENCES custom_quotes(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quote_tokens_token ON quote_tokens(token);
CREATE INDEX IF NOT EXISTS idx_quote_tokens_email ON quote_tokens(email);
CREATE INDEX IF NOT EXISTS idx_quote_tokens_quote_id ON quote_tokens(quote_id);

-- RLS policies
ALTER TABLE quote_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view own quote tokens" ON quote_tokens 
  FOR SELECT USING (auth.uid() = user_id);

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_quote_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;