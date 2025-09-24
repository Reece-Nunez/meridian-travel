import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdmin } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
}) : null;

export async function POST(request: Request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { quoteId, amount, currency = 'usd', userId } = body;

    if (!quoteId || !amount) {
      return NextResponse.json(
        { error: 'Quote ID and amount are required' },
        { status: 400 }
      );
    }

    console.log('Payment intent request:', { quoteId, amount, currency, userId });

    // Verify the quote exists (don't filter by user_id since RLS will handle access control)
    const supabaseAdmin = createSupabaseAdmin();
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('custom_quotes')
      .select('*, quote_version, payment_method')
      .eq('id', quoteId)
      .eq('status', 'approved')
      .single();

    if (quoteError || !quote) {
      console.error('Quote query error:', quoteError);
      return NextResponse.json(
        { error: 'Quote not found or not approved for payment' },
        { status: 404 }
      );
    }

    if (!quote.quoted_price) {
      return NextResponse.json(
        { error: 'Quote has no price set' },
        { status: 400 }
      );
    }

    console.log('Quote found:', { id: quote.id, destination: quote.destination, user_id: quote.user_id });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        quoteId: quoteId,
        userId: userId || quote.user_id || 'unknown',
        destination: quote.destination,
        participants: quote.participants.toString(),
        pricePerPerson: quote.quoted_price.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Store payment intent in database for tracking (use correct table name)
    const { error: insertError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        quote_id: quoteId,
        user_id: userId || quote.user_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount / 100, // Store in dollars
        currency: currency,
        status: 'pending',
        quote_version: quote.quote_version || 1,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error storing payment intent:', insertError);
      // Continue anyway - payment intent was created successfully
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}