'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { CustomQuote } from '@/types/database';
import ItineraryDisplay from '@/components/ItineraryDisplay';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';
import PaymentInstructions from '@/components/PaymentInstructions';

function QuoteDetailsContent() {
  const { user, loading: authLoading } = useAuth();
  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('stripe');
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quoteId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }

    // Check for payment success parameter
    const paymentParam = searchParams?.get('payment');
    if (paymentParam === 'success') {
      setPaymentSuccess(true);
      // Clear the URL parameter after showing success message
      setTimeout(() => {
        setPaymentSuccess(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);
    }

    if (user && quoteId) {
      fetchQuoteDetails();
    }
  }, [user, authLoading, quoteId, router, searchParams]);

  const fetchQuoteDetails = async () => {
    try {
      console.log('QuoteDetails: Starting fetchQuoteDetails for ID:', quoteId, 'User ID:', user?.id);
      
      const { data, error } = await supabase
        .from('custom_quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      console.log('QuoteDetails: Supabase response:', { data, error });

      if (error) {
        console.error('QuoteDetails: Supabase error:', error);
        setError('Quote not found or access denied');
      } else {
        console.log('QuoteDetails: Quote loaded successfully:', data);
        setQuote(data);
      }
    } catch (err) {
      console.error('QuoteDetails: Fetch error:', err);
      setError('Failed to load quote details');
    } finally {
      console.log('QuoteDetails: Fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  const calculateQuoteTotal = () => {
    if (!quote) return 0;

    // If we have detailed pricing breakdown, use that
    if (quote.adult_price || quote.child_price) {
      const adultTotal = (quote.adult_price || 0) * (quote.adult_count || 0);
      const childTotal = (quote.child_price || 0) * (quote.child_count || 0);
      return adultTotal + childTotal;
    }

    // Otherwise fall back to quoted_price * participants (legacy behavior)
    return parseFloat(quote.quoted_price?.toString() || '0') * quote.participants;
  };

  const handlePayment = async () => {
    if (!quote || !quote.quoted_price) return;

    // Handle non-Stripe payments
    if (selectedPaymentMethod !== 'stripe') {
      // Update quote with selected payment method
      try {
        const { error } = await supabase
          .from('custom_quotes')
          .update({ payment_method: selectedPaymentMethod })
          .eq('id', quote.id);

        if (error) throw error;

        // Show payment instructions
        setShowPaymentInstructions(true);
        return;
      } catch (err) {
        console.error('Error updating payment method:', err);
        setError('Failed to update payment method');
        return;
      }
    }

    // Handle Stripe payments
    try {
      setLoading(true);

      const totalAmount = calculateQuoteTotal();

      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          amount: totalAmount * 100, // Convert to cents
          currency: quote.quoted_currency?.toLowerCase() || 'usd',
          userId: user?.id,
          paymentMethod: selectedPaymentMethod
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
      case 'booked':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'reviewing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (authLoading) {
    console.log('QuoteDetails: Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  if (!user) {
    console.log('QuoteDetails: No user found, redirecting...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your quote.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('QuoteDetails: Quote loading...');
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

        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your booking has been confirmed and you'll receive a confirmation email shortly. 
                  Your booking reference will be provided once processing is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Quote Details */}
          <div className="lg:col-span-3 space-y-6">
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
                  {/* Display breakdown if we have adult/child pricing */}
                  {quote.adult_price || quote.child_price ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Pricing Breakdown</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {quote.adult_count && quote.adult_count > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Adults ({quote.adult_count}):</span>
                            <span className="font-medium text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(quote.adult_price || 0)} × {quote.adult_count} = {' '}
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format((quote.adult_price || 0) * quote.adult_count)}
                            </span>
                          </div>
                        )}
                        {quote.child_count && quote.child_count > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Children under 12 ({quote.child_count}):</span>
                            <span className="font-medium text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(quote.child_price || 0)} × {quote.child_count} = {' '}
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format((quote.child_price || 0) * quote.child_count)}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(((quote.adult_price || 0) * (quote.adult_count || 0)) + ((quote.child_price || 0) * (quote.child_count || 0)))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Price Per Person:</span>
                      <span className="text-2xl font-bold text-[#8B4513]">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: quote.quoted_currency || 'USD',
                        }).format(parseFloat(quote.quoted_price.toString()))}
                      </span>
                    </div>
                  )}
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

              {/* What's Included */}
              {quote.inclusions && quote.inclusions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-4">What's Included</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {quote.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* What's Not Included */}
              {quote.exclusions && quote.exclusions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-4">What's Not Included</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {quote.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
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
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Destination:</span>
                  <span className="font-medium text-[#8B4513]">{quote.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Duration:</span>
                  <span className="font-medium text-[#8B4513]">{quote.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Participants:</span>
                  <span className="font-medium text-[#8B4513]">{quote.participants}</span>
                </div>
                {quote.quoted_price && (
                  <>
                    <div className="border-t pt-3">
                      {/* Show breakdown if we have detailed pricing */}
                      {quote.adult_price || quote.child_price ? (
                        <div className="space-y-2">
                          {quote.adult_count && quote.adult_count > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Adults ({quote.adult_count}):</span>
                              <span className="text-[#8B4513]">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: quote.quoted_currency || 'USD',
                                }).format((quote.adult_price || 0) * quote.adult_count)}
                              </span>
                            </div>
                          )}
                          {quote.child_count && quote.child_count > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Children ({quote.child_count}):</span>
                              <span className="text-[#8B4513]">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: quote.quoted_currency || 'USD',
                                }).format((quote.child_price || 0) * quote.child_count)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-semibold border-t pt-2">
                            <span className='text-gray-900'>Total:</span>
                            <span className="text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(calculateQuoteTotal())}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-900 font-medium">Price Per Person:</span>
                            <span className="font-medium text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(parseFloat(quote.quoted_price.toString()))}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold">
                            <span className='text-gray-900'>Total ({quote.participants} {quote.participants === 1 ? 'person' : 'people'}):</span>
                            <span className="text-[#8B4513]">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: quote.quoted_currency || 'USD',
                              }).format(calculateQuoteTotal())}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {quote.status === 'approved' && quote.quoted_price ? (
                <div className="space-y-6">
                  {!showPaymentInstructions && (
                    <PaymentMethodSelector
                      selectedMethod={selectedPaymentMethod}
                      onMethodChange={setSelectedPaymentMethod}
                      disabled={loading}
                    />
                  )}

                  {showPaymentInstructions && selectedPaymentMethod !== 'stripe' ? (
                    <PaymentInstructions
                      paymentMethod={selectedPaymentMethod}
                      quote={quote}
                      totalAmount={calculateQuoteTotal()}
                    />
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' :
                        selectedPaymentMethod === 'stripe' ? 'Book & Pay Now' :
                        selectedPaymentMethod === 'ach' ? 'Get Bank Transfer Instructions' :
                        'Get Check Payment Instructions'
                      }
                    </button>
                  )}

                  {showPaymentInstructions && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">Payment Method Selected</p>
                      </div>
                      <p className="text-xs text-green-600 mb-4">
                        Follow the instructions above to complete your payment. We'll confirm your booking once payment is received.
                      </p>
                      <button
                        onClick={() => setShowPaymentInstructions(false)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        ← Choose Different Payment Method
                      </button>
                    </div>
                  )}
                </div>
              ) : quote.status === 'booked' ? (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-medium text-green-800">Booking Confirmed</p>
                  </div>
                  <p className="text-xs text-green-600">Your trip has been successfully booked and paid for</p>
                </div>
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

        {/* Full-Width Itinerary Display - Below payment section */}
        {quote.status === 'approved' && (
          <div className="mt-12">
            <div className="bg-white shadow-sm rounded-lg p-8">
              <ItineraryDisplay 
                quoteId={quote.id} 
                title={`${quote.destination} Itinerary`}
                className="max-w-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuoteDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote details...</p>
        </div>
      </div>
    }>
      <QuoteDetailsContent />
    </Suspense>
  );
}