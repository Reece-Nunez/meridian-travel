import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('Testing email send to:', email);
    console.log('Using API key:', resendApiKey.substring(0, 10) + '...');

    // Send test email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'quotes@meridianluxury.travel',
        to: [email],
        subject: 'Test Email from Meridian Travel',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email to verify the email system is working.</p>
          <p>If you received this, the email configuration is correct!</p>
        `,
      }),
    });

    console.log('Email response status:', emailResponse.status);

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError,
          status: emailResponse.status
        },
        { status: 500 }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: emailResult.id,
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}