import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdmin } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
}) : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY || !stripe || !endpointSecret) {
      return NextResponse.json(
        { error: 'Webhook processing not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Update payment status in database
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'succeeded',
            completed_at: new Date().toISOString(),
            metadata: paymentIntent.metadata,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          return NextResponse.json(
            { error: 'Failed to update payment status' },
            { status: 500 }
          );
        }

        // Get payment details to create booking
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (paymentError || !payment) {
          console.error('Error fetching payment:', paymentError);
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          );
        }

        // Get quote details
        const { data: quote, error: quoteError } = await supabaseAdmin
          .from('custom_quotes')
          .select('*')
          .eq('id', payment.quote_id)
          .single();

        if (quoteError || !quote) {
          console.error('Error fetching quote:', quoteError);
          return NextResponse.json(
            { error: 'Quote not found' },
            { status: 404 }
          );
        }

        // Generate booking reference
        const bookingReference = `MT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create booking record
        const { data: booking, error: bookingError } = await supabaseAdmin
          .from('bookings')
          .insert({
            user_id: payment.user_id,
            custom_quote_id: payment.quote_id,
            booking_reference: bookingReference,
            status: 'confirmed',
            total_amount: payment.amount,
            currency: payment.currency,
            full_payment_paid: true,
            stripe_payment_intent_id: paymentIntent.id,
            travel_date_start: quote.travel_dates_start,
            travel_date_end: quote.travel_dates_end,
            participants: quote.participants,
            participant_details: [], // This can be filled in later by user
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
          return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
          );
        }

        // Update payment record with booking ID
        await supabaseAdmin
          .from('payments')
          .update({ booking_id: booking.id })
          .eq('id', payment.id);

        // Update quote status to 'booked'
        await supabaseAdmin
          .from('custom_quotes')
          .update({ status: 'booked' })
          .eq('id', payment.quote_id);

        console.log('Booking created successfully:', booking.booking_reference);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // Update payment status in database
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            metadata: paymentIntent.metadata,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment canceled:', paymentIntent.id);

        // Update payment status in database
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'cancelled',
            metadata: paymentIntent.metadata,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}