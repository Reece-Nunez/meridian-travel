-- Step 3: Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

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