import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Test email endpoint called');
    
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('Sending test email to:', to);

    // Test email with Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_baftfqmj_3jQHaPtCBRjgphPzso9kUHj5',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [to],
        subject: 'Test Email from Meridian Travel',
        html: '<h1>Test Email</h1><p>This is a test email to verify Resend integration.</p>',
      }),
    });

    console.log('Resend response status:', emailResponse.status);

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError, status: emailResponse.status },
        { status: 500 }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: emailResult.id
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}