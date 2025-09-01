'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetails {
  id: string;
  booking_reference: string;
  travel_date: string;
  participants: number;
  total_amount: number;
  currency: string;
  status: string;
  special_requests?: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  created_at: string;
  trip_packages: {
    title: string;
    destination: string;
    duration: number;
    images?: string[];
  };
}

export default function BookingConfirmation() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    fetchBooking();
  }, [params.id, user]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip_packages(title, destination, duration, images)
        `)
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          router.push('/dashboard');
          return;
        }
        throw error;
      }

      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#8B4513]">Booking Confirmed!</h1>
              <p className="text-gray-600 mt-2">
                Thank you for choosing Meridian Luxury Travel. Your booking request has been received.
              </p>
            </div>
            <div className="bg-[#F5F5DC] rounded-lg p-4 inline-block">
              <p className="text-sm font-medium text-[#8B4513]">
                Booking Reference: <span className="font-bold text-lg">{booking.booking_reference}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Trip Details</h2>
              
              <div className="flex items-start space-x-4 mb-6">
                {booking.trip_packages.images && booking.trip_packages.images[0] && (
                  <img
                    src={booking.trip_packages.images[0]}
                    alt={booking.trip_packages.title}
                    className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.trip_packages.title}</h3>
                  <p className="text-gray-600">
                    {booking.trip_packages.destination} • {booking.trip_packages.duration} days
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Travel Date</h4>
                  <p className="text-gray-900">{new Date(booking.travel_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Participants</h4>
                  <p className="text-gray-900">{booking.participants} participant{booking.participants > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Amount</h4>
                  <p className="text-2xl font-bold text-[#B8860B]">{formatPrice(booking.total_amount)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Booking Date</h4>
                  <p className="text-gray-900">{new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(booking.emergency_contact || booking.dietary_restrictions || booking.special_requests) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Additional Information</h2>
                <div className="space-y-4">
                  {booking.emergency_contact && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Emergency Contact</h4>
                      <p className="text-gray-900">{booking.emergency_contact}</p>
                    </div>
                  )}
                  {booking.dietary_restrictions && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Dietary Restrictions</h4>
                      <p className="text-gray-900">{booking.dietary_restrictions}</p>
                    </div>
                  )}
                  {booking.special_requests && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Special Requests</h4>
                      <p className="text-gray-900">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-[#F5F5DC] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#8B4513] mb-4">What Happens Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Confirmation Review</h3>
                    <p className="text-gray-600 text-sm">
                      Our travel specialists will review your booking and confirm availability within 24 hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Payment Processing</h3>
                    <p className="text-gray-600 text-sm">
                      Once confirmed, we'll send you a secure payment link to complete your booking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Trip Preparation</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive detailed trip information, packing lists, and preparation guides.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    4
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Adventure Begins!</h3>
                    <p className="text-gray-600 text-sm">
                      Enjoy your expertly crafted luxury travel experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our travel specialists are here to assist you with any questions.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+1-555-012-3456" className="text-gray-900 hover:text-[#B8860B]">
                    +1 (555) 012-3456
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@meridianluxurytravel.com" className="text-gray-900 hover:text-[#B8860B]">
                    info@meridianluxurytravel.com
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Reference your booking ID: {booking.booking_reference}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full bg-[#B8860B] hover:bg-[#DAA520] text-white text-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  View All Bookings
                </Link>
                <Link
                  href="/packages"
                  className="block w-full border border-[#B8860B] text-[#8B4513] hover:bg-[#F5F5DC] text-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Browse More Trips
                </Link>
                <Link
                  href="/contact"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Save Booking */}
            <div className="bg-[#F5F5DC] rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Save this confirmation for your records
              </p>
              <button
                onClick={() => window.print()}
                className="text-[#B8860B] hover:text-[#DAA520] font-medium text-sm flex items-center justify-center mx-auto"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Confirmation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}