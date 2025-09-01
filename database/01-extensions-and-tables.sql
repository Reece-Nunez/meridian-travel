-- Step 1: Enable extensions and create tables
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
  price_usd DECIMAL(10,2) NOT NULL,
  price_eur DECIMAL(10,2),
  price_gbp DECIMAL(10,2),
  itinerary JSONB, -- detailed day-by-day itinerary
  images TEXT[], -- array of image URLs
  max_participants INTEGER DEFAULT 20,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'approved', 'rejected')),
  quoted_price DECIMAL(10,2),
  quoted_currency TEXT DEFAULT 'USD',
  admin_notes TEXT
);