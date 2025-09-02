'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Booking, TripPackage, CustomQuote, PaymentHistory } from '@/types/database';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';

interface BookingWithDetails extends Booking {
  trip_packages?: TripPackage;
  custom_quotes?: CustomQuote;
  payment_history?: PaymentHistory[];
}

export default function BookingDetail() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    status: 'pending',
    cancellation_reason: '',
    special_requests: '',
    deposit_paid: false,
    full_payment_paid: false
  });

  useEffect(() => {
    if (isAuthenticated && bookingId) {
      fetchBooking();
    }
  }, [isAuthenticated, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip_packages (
            id,
            title,
            destination,
            duration,
            description,
            price_usd,
            images
          ),
          custom_quotes (
            id,
            destination,
            duration,
            contact_email,
            contact_phone,
            quoted_price,
            quoted_currency
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      if (data) {
        setBooking(data);
        setFormData({
          status: data.status || 'pending',
          cancellation_reason: data.cancellation_reason || '',
          special_requests: data.special_requests || '',
          deposit_paid: data.deposit_paid || false,
          full_payment_paid: data.full_payment_paid || false
        });

        // Fetch payment history
        fetchPaymentHistory(data.id);
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (booking) {
        setBooking(prev => prev ? { ...prev, payment_history: data || [] } : null);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        status: formData.status as 'pending' | 'confirmed' | 'paid' | 'cancelled',
        cancellation_reason: formData.cancellation_reason || null,
        special_requests: formData.special_requests || null,
        deposit_paid: formData.deposit_paid,
        full_payment_paid: formData.full_payment_paid,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      if (booking) {
        setBooking({ ...booking, ...updateData });
      }

      alert('Booking updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTripInfo = (booking: BookingWithDetails) => {
    if (booking.trip_packages) {
      return {
        title: booking.trip_packages.title,
        destination: booking.trip_packages.destination,
        duration: booking.trip_packages.duration,
        description: booking.trip_packages.description,
        price: booking.trip_packages.price_usd,
        type: 'Package',
        images: booking.trip_packages.images
      };
    } else if (booking.custom_quotes) {
      return {
        title: 'Custom Trip',
        destination: booking.custom_quotes.destination,
        duration: booking.custom_quotes.duration,
        description: null,
        price: booking.custom_quotes.quoted_price,
        type: 'Custom Quote',
        images: null
      };
    }
    return {
      title: 'Unknown Trip',
      destination: 'Unknown',
      duration: 0,
      description: null,
      price: null,
      type: 'Unknown',
      images: null
    };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <Link
            href="/admin/bookings"
            className="text-[#B8860B] hover:text-[#DAA520] font-medium"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const tripInfo = getTripInfo(booking);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin/bookings"
                className="text-gray-500 hover:text-[#8B4513] mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-[#8B4513]">Booking Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">{booking.booking_reference}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status || 'pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Information */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Trip Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Trip Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trip Type</label>
                  <p className="mt-1 text-sm text-gray-900">{tripInfo.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{tripInfo.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <p className="mt-1 text-sm text-gray-900">{tripInfo.destination}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="mt-1 text-sm text-gray-900">{tripInfo.duration} days</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.participants} traveler{booking.participants !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(booking.created_at)}</p>
                </div>
              </div>

              {booking.travel_date_start && booking.travel_date_end && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Travel Dates</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(booking.travel_date_start).toLocaleDateString()} - {new Date(booking.travel_date_end).toLocaleDateString()}
                  </p>
                </div>
              )}

              {tripInfo.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{tripInfo.description}</p>
                </div>
              )}
            </div>

            {/* Participant Details */}
            {booking.participant_details && booking.participant_details.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Participant Details</h3>
                
                <div className="space-y-4">
                  {booking.participant_details.map((participant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Traveler {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="mt-1 text-sm text-gray-900">{participant.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{participant.email}</p>
                        </div>
                        {participant.phone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-sm text-gray-900">{participant.phone}</p>
                          </div>
                        )}
                        {participant.dietary_restrictions && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
                            <p className="mt-1 text-sm text-gray-900">{participant.dietary_restrictions}</p>
                          </div>
                        )}
                        {participant.emergency_contact && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                            <p className="mt-1 text-sm text-gray-900">{participant.emergency_contact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {booking.payment_history && booking.payment_history.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Payment History</h3>
                
                <div className="space-y-4">
                  {booking.payment_history.map((payment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-sm text-gray-800 capitalize">
                            {payment.payment_type?.replace('_', ' ')} Payment
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800">
                        <p>{formatDate(payment.created_at)}</p>
                        {payment.stripe_payment_intent_id && (
                          <p className="font-mono">{payment.stripe_payment_intent_id}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Admin Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.total_amount, booking.currency)}
                  </span>
                </div>

                {booking.deposit_amount && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Deposit:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.deposit_amount, booking.currency)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Deposit Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.deposit_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.deposit_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Full Payment:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.full_payment_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.full_payment_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Update Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Update Booking</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="deposit_paid"
                      name="deposit_paid"
                      checked={formData.deposit_paid}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300 rounded"
                    />
                    <label htmlFor="deposit_paid" className="ml-2 block text-sm text-gray-900">
                      Deposit Paid
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="full_payment_paid"
                      name="full_payment_paid"
                      checked={formData.full_payment_paid}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300 rounded"
                    />
                    <label htmlFor="full_payment_paid" className="ml-2 block text-sm text-gray-900">
                      Full Payment Paid
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    id="special_requests"
                    name="special_requests"
                    rows={3}
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                {formData.status === 'cancelled' && (
                  <div>
                    <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Reason
                    </label>
                    <textarea
                      id="cancellation_reason"
                      name="cancellation_reason"
                      rows={3}
                      value={formData.cancellation_reason}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      placeholder="Reason for cancellation..."
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/admin/bookings"
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Bookings
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Update Booking'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}