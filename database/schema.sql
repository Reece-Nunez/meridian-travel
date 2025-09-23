-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (optional user profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  emergency_contact TEXT,
  dietary_restrictions TEXT,
  travel_preferences TEXT
);

-- Create trip_packages table (predefined packages)
CREATE TABLE IF NOT EXISTS trip_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in days
  itinerary JSONB, -- detailed day-by-day itinerary
  images TEXT[], -- array of image URLs
  max_participants INTEGER DEFAULT 20,
  includes TEXT[], -- what's included in the package
  excludes TEXT[], -- what's not included
  is_active BOOLEAN DEFAULT true
);

-- Create custom_quotes table (custom trip requests)
CREATE TABLE IF NOT EXISTS custom_quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  duration INTEGER NOT NULL,
  participants INTEGER NOT NULL,
  budget_range TEXT,
  travel_dates_start DATE,
  travel_dates_end DATE,
  special_requirements TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  quoted_price DECIMAL(10,2),
  quoted_currency TEXT DEFAULT 'USD',
  admin_notes TEXT
);

-- Create bookings table (confirmed bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES trip_packages(id) ON DELETE SET NULL,
  custom_quote_id UUID REFERENCES custom_quotes(id) ON DELETE SET NULL,
  booking_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  full_payment_paid BOOLEAN DEFAULT false,
  stripe_payment_intent_id TEXT,
  stripe_deposit_intent_id TEXT,
  travel_date_start DATE,
  travel_date_end DATE,
  participants INTEGER NOT NULL,
  participant_details JSONB, -- array of participant info
  special_requests TEXT,
  cancellation_reason TEXT
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('deposit', 'full_payment', 'refund')),
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_charge_id TEXT,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT
);

-- Create content_sections table (CMS content management)
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  section_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true
);

-- Create site_settings table (general site settings)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'email', 'phone', 'url', 'textarea')),
  description TEXT
);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Custom quotes policies
CREATE POLICY "Users can view own quotes" ON custom_quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create quotes" ON custom_quotes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view own payment history" ON payment_history FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM bookings WHERE id = booking_id));

-- Trip packages are publicly readable (no RLS needed as they're public)
ALTER TABLE trip_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip packages are publicly readable" ON trip_packages FOR SELECT USING (is_active = true);

-- Content sections policies (publicly readable, admin manageable)
CREATE POLICY "Content sections are publicly readable" ON content_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Content sections are manageable" ON content_sections FOR ALL USING (true);

-- Site settings policies (publicly readable, admin manageable)
CREATE POLICY "Site settings are publicly readable" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings are manageable" ON site_settings FOR ALL USING (true);

-- Quote tokens policies
ALTER TABLE quote_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quote tokens" ON quote_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Functions to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := 'MLT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_quote_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_packages_updated_at BEFORE UPDATE ON trip_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_quotes_updated_at BEFORE UPDATE ON custom_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON content_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();