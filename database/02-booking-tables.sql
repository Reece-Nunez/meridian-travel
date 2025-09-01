-- Step 2: Create booking and payment tables

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