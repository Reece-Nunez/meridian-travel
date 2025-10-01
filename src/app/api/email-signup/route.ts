import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Store email in database
    const { data: existingSignup, error: checkError } = await supabase
      .from('email_signups')
      .select('email')
      .eq('email', email)
      .single();

    if (existingSignup) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 200 }
      );
    }

    // Insert new signup
    const { error: insertError } = await supabase
      .from('email_signups')
      .insert({
        email: email,
        source: 'coming_soon_page',
        subscribed_at: new Date().toISOString()
      });

    if (insertError && !insertError.message.includes('relation "email_signups" does not exist')) {
      console.error('Error storing email:', insertError);
    }

    // Send notification email to Chris
    try {
      await resend.emails.send({
        from: 'Meridian Luxury Travel <onboarding@resend.dev>',
        to: 'chris@meridianluxury.travel',
        replyTo: 'chris@meridianluxury.travel',
        subject: 'New Email Signup - Coming Soon Page',
        html: `
          <h2>New Email Signup</h2>
          <p>Someone just signed up for launch notifications!</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Source:</strong> Coming Soon Page</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This notification was sent from your Meridian Luxury Travel website.</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the signup if notification email fails
    }

    return NextResponse.json(
      { message: 'Successfully signed up for notifications' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
}
