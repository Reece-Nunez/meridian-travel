import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, amount, currency = 'usd' } = body;

    if (!quoteId || !amount) {
      return NextResponse.json(
        { error: 'Quote ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify the quote exists and get user info
    const supabaseAdmin = createSupabaseAdmin();
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('custom_quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('status', 'approved')
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found or not approved' },
        { status: 404 }
      );
    }

    if (!quote.quoted_price) {
      return NextResponse.json(
        { error: 'Quote has no price set' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        quoteId: quoteId,
        userId: quote.user_id,
        destination: quote.destination,
        participants: quote.participants.toString(),
        pricePerPerson: quote.quoted_price.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in database for tracking
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        quote_id: quoteId,
        user_id: quote.user_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount / 100, // Store in dollars
        currency: currency,
        status: 'pending',
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