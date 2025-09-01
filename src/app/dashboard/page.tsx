'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Booking, CustomQuote } from '@/types/database';

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard: useEffect triggered with authLoading:', authLoading, 'user:', !!user);
    
    if (!authLoading && !user) {
      console.log('Dashboard: No user, redirecting to signin');
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }

    if (user) {
      console.log('Dashboard: User found, fetching user data');
      fetchUserData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    console.log('Dashboard: Component mounted');
    return () => console.log('Dashboard: Component unmounted');
  }, []);

  const fetchUserData = async () => {
    if (!user) return;

    console.log('Dashboard: Starting to fetch user data for user:', user.id);
    setLoading(true);

    try {
      // Fetch user bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          trip_packages(title, destination, duration),
          custom_quotes(destination, duration)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch user custom quotes
      const { data: quotesData } = await supabase
        .from('custom_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Dashboard: User data fetched successfully');
      setBookings(bookingsData || []);
      setQuotes(quotesData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      console.log('Dashboard: Setting dashboard loading to false');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'quoted':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'reviewing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (authLoading || loading) {
    console.log('Dashboard: Showing loading spinner - authLoading:', authLoading, 'loading:', loading);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#8B4513]">
                Welcome back, {profile?.first_name || user.email?.split('@')[0] || 'Traveler'}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your trips and explore new destinations</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/profile"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#8B4513] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/packages"
                  className="block w-full bg-[#B8860B] hover:bg-[#DAA520] text-white text-center px-4 py-3 rounded-md font-medium transition-colors"
                >
                  Browse Trip Packages
                </Link>
                <Link
                  href="/quote"
                  className="block w-full bg-white border-2 border-[#B8860B] text-[#8B4513] hover:bg-[#F5F5DC] text-center px-4 py-3 rounded-md font-medium transition-colors"
                >
                  Request Custom Quote
                </Link>
                <Link
                  href="/destinations"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center px-4 py-3 rounded-md font-medium transition-colors"
                >
                  Explore Destinations
                </Link>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-[#8B4513] mb-4">Your Account</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-semibold">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Quotes:</span>
                  <span className="font-semibold">
                    {quotes.filter(q => q.status === 'pending' || q.status === 'reviewing').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-semibold">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Bookings */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#8B4513]">Your Bookings</h2>
              </div>
              <div className="p-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                    <Link
                      href="/packages"
                      className="text-[#B8860B] hover:text-[#DAA520] font-medium"
                    >
                      Browse our trip packages →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {booking.booking_reference}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {/* @ts-ignore - We know this will have the joined data */}
                              {booking.trip_packages?.title || booking.custom_quotes?.destination}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {booking.participants} participant{booking.participants > 1 ? 's' : ''} • 
                              {booking.currency} ${booking.total_amount}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={getStatusBadge(booking.status || 'pending')}>
                              {booking.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Quote Requests */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#8B4513]">Quote Requests</h2>
              </div>
              <div className="p-6">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No custom quote requests yet.</p>
                    <Link
                      href="/quote"
                      className="text-[#B8860B] hover:text-[#DAA520] font-medium"
                    >
                      Request a custom quote →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {quote.destination}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {quote.duration} days • {quote.participants} participant{quote.participants > 1 ? 's' : ''}
                            </p>
                            {quote.quoted_price && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                Quoted: {quote.quoted_currency} ${quote.quoted_price}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={getStatusBadge(quote.status || 'pending')}>
                              {quote.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(quote.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}