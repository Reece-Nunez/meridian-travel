'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CustomQuote } from '@/types/database';

export default function QuoteDetails() {
  const { user, loading: authLoading } = useAuth();
  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }

    if (user && quoteId) {
      fetchQuoteDetails();
    }
  }, [user, authLoading, quoteId, router]);

  const fetchQuoteDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', user?.id) // Ensure user can only access their own quotes
        .single();

      if (error) {
        console.error('Error fetching quote:', error);
        setError('Quote not found or access denied');
      } else {
        setQuote(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!quote || !quote.quoted_price) return;

    try {
      setLoading(true);
      
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          amount: parseFloat(quote.quoted_price.toString()) * 100, // Convert to cents
          currency: quote.quoted_currency?.toLowerCase() || 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      
      // Redirect to payment page with client secret
      router.push(`/dashboard/quotes/${quote.id}/payment?client_secret=${clientSecret}`);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'reviewing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'quoted':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#8B4513] mb-4">Quote Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The requested quote could not be found.'}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8860B] hover:bg-[#DAA520]"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#B8860B] hover:text-[#DAA520] mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#8B4513]">Quote Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#8B4513]">{quote.destination}</h2>
                  <p className="text-gray-600">{quote.duration} days • {quote.participants} participant{quote.participants > 1 ? 's' : ''}</p>
                </div>
                <span className={getStatusBadge(quote.status || 'pending')}>
                  {quote.status}
                </span>
              </div>

              {quote.quoted_price && (
                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Quote Price:</span>
                    <span className="text-2xl font-bold text-[#8B4513]">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: quote.quoted_currency || 'USD',
                      }).format(parseFloat(quote.quoted_price.toString()))}
                    </span>
                  </div>
                </div>
              )}

              {/* Travel Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Travel Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Budget Range:</p>
                    <p className="font-medium text-[#8B4513]">${quote.budget_range}</p>
                  </div>
                  {quote.travel_dates_start && (
                    <div>
                      <p className="text-gray-600">Travel Dates:</p>
                      <p className="font-medium">
                        {new Date(quote.travel_dates_start).toLocaleDateString()} - {' '}
                        {quote.travel_dates_end ? new Date(quote.travel_dates_end).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Contact Email:</p>
                    <p className="font-medium text-[#8B4513]">{quote.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact Phone:</p>
                    <p className="font-medium text-[#8B4513]">{quote.contact_phone}</p>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {quote.special_requirements && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Requirements & Preferences</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {quote.special_requirements}
                    </pre>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {quote.admin_notes && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Travel Agent Notes</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">{quote.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium text-[#8B4513]">{quote.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-[#8B4513]">{quote.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium text-[#8B4513]">{quote.participants}</span>
                </div>
                {quote.quoted_price && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className='text-gray-600'>Total:</span>
                        <span className="text-[#8B4513]">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: quote.quoted_currency || 'USD',
                          }).format(parseFloat(quote.quoted_price.toString()))}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {quote.status === 'approved' && quote.quoted_price ? (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Book & Pay Now'}
                </button>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {quote.status === 'pending' && 'Waiting for quote approval'}
                    {quote.status === 'reviewing' && 'Quote under review'}
                    {quote.status === 'rejected' && 'Quote was not approved'}
                    {!quote.quoted_price && 'No price quoted yet'}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Secure payment processed by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}