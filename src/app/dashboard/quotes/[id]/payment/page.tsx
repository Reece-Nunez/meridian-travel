'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CustomQuote } from '@/types/database';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';

// Initialize Stripe - you'll need to add your publishable key to env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  quote: CustomQuote;
  clientSecret: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({ quote, clientSecret, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: quote.contact_email,
          phone: quote.contact_phone,
        },
      },
    });

    if (error) {
      onPaymentError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onPaymentSuccess();
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-white">
          <CardElement options={cardStyle} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Payment Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Destination:</span>
            <span className="font-medium">{quote.destination}</span>
          </div>
          <div className="flex justify-between">
            <span>Participants:</span>
            <span className="font-medium">{quote.participants}</span>
          </div>
          <div className="flex justify-between">
            <span>Price per person:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: quote.quoted_currency || 'USD',
              }).format(parseFloat(quote.quoted_price!.toString()))}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: quote.quoted_currency || 'USD',
                }).format(parseFloat(quote.quoted_price!.toString()) * quote.participants)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing Payment...' : 'Complete Payment'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quoteId = params.id as string;
  const clientSecret = searchParams?.get('client_secret');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }

    if (user && quoteId && clientSecret) {
      fetchQuoteDetails();
    } else if (!clientSecret) {
      setError('Invalid payment session');
      setLoading(false);
    }
  }, [user, authLoading, quoteId, clientSecret, router]);

  const fetchQuoteDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', user?.id)
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        setError('Quote not found or not approved for payment');
      } else if (!data.quoted_price) {
        setError('Quote has no price set');
      } else {
        setQuote(data);
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect to success page after a brief delay
    setTimeout(() => {
      router.push(`/dashboard/quotes/${quoteId}?payment=success`);
    }, 3000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#8B4513] mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You'll receive a confirmation email shortly.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to your quote details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !quote || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#8B4513] mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/dashboard/quotes/${quoteId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8860B] hover:bg-[#DAA520]"
            >
              ← Back to Quote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/dashboard/quotes/${quoteId}`}
            className="inline-flex items-center text-[#B8860B] hover:text-[#DAA520] mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quote
          </Link>
          <h1 className="text-3xl font-bold text-[#8B4513]">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Secure your booking for {quote.destination}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm 
              quote={quote}
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}