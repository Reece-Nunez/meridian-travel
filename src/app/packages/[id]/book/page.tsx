'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface BookingFormData {
  travel_date: string;
  participants: number;
  special_requests: string;
  emergency_contact: string;
  dietary_restrictions: string;
}

export default function BookPackage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [pkg, setPkg] = useState<TripPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    travel_date: '',
    participants: 1,
    special_requests: '',
    emergency_contact: profile?.emergency_contact || '',
    dietary_restrictions: profile?.dietary_restrictions || '',
  });

  useEffect(() => {
    if (!user) {
      router.push(`/auth/signin?redirect=/packages/${params.id}/book`);
      return;
    }
    
    fetchPackage();
  }, [params.id, user]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        emergency_contact: profile.emergency_contact || prev.emergency_contact,
        dietary_restrictions: profile.dietary_restrictions || prev.dietary_restrictions,
      }));
    }
  }, [profile]);

  const fetchPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          router.push('/packages');
          return;
        }
        throw error;
      }

      setPkg(data);
    } catch (error) {
      console.error('Error fetching package:', error);
      router.push('/packages');
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

  const calculateTotal = () => {
    if (!pkg) return 0;
    return pkg.price_usd * formData.participants;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !pkg) {
      return;
    }

    setSubmitting(true);

    try {
      // Generate booking reference
      const bookingReference = `MLT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          trip_package_id: pkg.id,
          booking_reference: bookingReference,
          travel_date: formData.travel_date,
          participants: formData.participants,
          total_amount: calculateTotal(),
          currency: 'USD',
          status: 'pending',
          special_requests: formData.special_requests || null,
          emergency_contact: formData.emergency_contact || null,
          dietary_restrictions: formData.dietary_restrictions || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Redirect to confirmation page
      router.push(`/bookings/${booking.id}/confirmation`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participants' ? parseInt(value) : value
    }));
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

  if (!pkg || !user) {
    return null;
  }

  // Calculate minimum date (30 days from now for planning purposes)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 30);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link href="/packages" className="hover:text-[#B8860B]">
                  Packages
                </Link>
                <span>/</span>
                <Link href={`/packages/${params.id}`} className="hover:text-[#B8860B]">
                  {pkg.title}
                </Link>
                <span>/</span>
                <span className="text-gray-900">Book</span>
              </nav>
              <h1 className="text-2xl font-bold text-[#8B4513]">Book Your Trip</h1>
              <p className="text-gray-600 mt-1">{pkg.title} • {pkg.destination}</p>
            </div>
            <Link
              href={`/packages/${params.id}`}
              className="text-[#B8860B] hover:text-[#DAA520] font-medium"
            >
              ← Back to Details
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}` 
                        : ''}
                      disabled
                      placeholder="Please complete your profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    {(!profile?.first_name || !profile?.last_name) && (
                      <p className="mt-1 text-sm text-red-600">
                        <Link href="/profile" className="text-[#B8860B] hover:text-[#DAA520]">
                          Please complete your profile →
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Trip Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="travel_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Travel Date *
                    </label>
                    <input
                      type="date"
                      id="travel_date"
                      name="travel_date"
                      value={formData.travel_date}
                      onChange={handleInputChange}
                      min={minDateString}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Please select a date at least 30 days in advance
                    </p>
                  </div>
                  <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Participants *
                    </label>
                    <select
                      id="participants"
                      name="participants"
                      value={formData.participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    >
                      {Array.from({ length: Math.min(pkg.max_participants || 10, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} participant{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Additional Information</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      placeholder="Name and phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    />
                  </div>
                  <div>
                    <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions & Allergies
                    </label>
                    <textarea
                      id="dietary_restrictions"
                      name="dietary_restrictions"
                      value={formData.dietary_restrictions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Please list any dietary restrictions or allergies..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    />
                  </div>
                  <div>
                    <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      id="special_requests"
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any special requests or requirements for your trip..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300 rounded"
                    />
                    <div className="ml-3 text-sm">
                      <p className="text-gray-600">
                        I agree to the{' '}
                        <Link href="/terms" className="text-[#B8860B] hover:text-[#DAA520]">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#B8860B] hover:text-[#DAA520]">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !profile?.first_name || !profile?.last_name}
                  className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Submit Booking Request'}
                </button>
                
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Your booking will be confirmed within 24 hours. Payment will be processed after confirmation.
                </p>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Booking Summary</h3>
              
              {/* Trip Overview */}
              <div className="space-y-3 mb-6">
                {pkg.images && pkg.images[0] && (
                  <img
                    src={pkg.images[0]}
                    alt={pkg.title}
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{pkg.title}</h4>
                  <p className="text-sm text-gray-600">{pkg.destination} • {pkg.duration} days</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Price per person:</span>
                  <span>{formatPrice(pkg.price_usd)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Participants:</span>
                  <span>{formData.participants}</span>
                </div>
                {formData.travel_date && (
                  <div className="flex justify-between text-sm">
                    <span>Travel Date:</span>
                    <span>{new Date(formData.travel_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg text-[#B8860B]">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#F5F5DC] rounded-md">
                <h4 className="font-medium text-[#8B4513] mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll review your booking request</li>
                  <li>• Confirm availability for your dates</li>
                  <li>• Send you a payment link</li>
                  <li>• Provide detailed trip information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}