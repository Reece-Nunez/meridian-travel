import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { quoteId, adminEmail } = await request.json();

    // Verify admin authentication
    if (adminEmail !== 'chris@meridianluxury.travel') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Get quote details
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('custom_quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Only send email for approved quotes with quoted price
    if (quote.status !== 'approved' || !quote.quoted_price) {
      return NextResponse.json(
        { error: 'Quote must be approved with a quoted price' },
        { status: 400 }
      );
    }

    // Generate secure token for account linking
    const token = generateFallbackToken();

    // Store token in database
    try {
      const { error: tokenError } = await supabaseAdmin
        .from('quote_tokens')
        .insert({
          quote_id: quoteId,
          token,
          email: quote.contact_email
        });

      if (tokenError) {
        console.error('Error storing token:', tokenError);
        console.error('Token error details:', tokenError);
        // For now, continue without token storage if table doesn't exist
        console.log('Continuing without token storage...');
      }
    } catch (tokenError) {
      console.error('Token storage failed:', tokenError);
      console.log('Continuing without token storage for testing...');
    }

    // Create signup link with token
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const signupLink = `${baseUrl}/auth/signup?quote_token=${token}`;

    // Format quoted price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.quoted_currency || 'USD',
      minimumFractionDigits: 0,
    }).format(quote.quoted_price);

    // Prepare email content
    const emailSubject = 'Your Peru Travel Quote Has Been Approved! 🇵🇪';
    const emailContent = `
      <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #F5F5DC;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            
            <!-- Header with Logo -->
            <div style="background: linear-gradient(135deg, #8B4513, #DAA520); padding: 40px 30px; text-align: center; color: white;">
              <!-- Company Logo -->
              <img src="${baseUrl}/logo.png" alt="Meridian Luxury Travel" 
                   style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; display: block; border: 3px solid rgba(255,255,255,0.3); object-fit: cover;"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <!-- Fallback if logo doesn't load -->
              <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; display: none; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
                <div style="color: white; font-size: 32px; font-weight: bold;">M</div>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎉 Great News!</h1>
              <p style="margin: 15px 0 0 0; font-size: 20px; opacity: 0.95;">Your Peru travel quote has been approved</p>
            </div>

            <!-- Quote Details Card -->
            <div style="padding: 40px 30px;">
              <div style="background: linear-gradient(135deg, #f8f5f0, #faf8f5); padding: 30px; border-radius: 12px; border-left: 5px solid #DAA520; margin-bottom: 30px;">
                <h2 style="color: #8B4513; margin-top: 0; font-size: 24px; margin-bottom: 25px; display: flex; align-items: center;">
                  <span style="background: #DAA520; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; margin-right: 15px;">✓</span>
                  Your Approved Quote
                </h2>
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                    <span style="color: #666; font-weight: 500;">Destination:</span>
                    <span style="color: #8B4513; font-weight: 600;">${quote.destination}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                    <span style="color: #666; font-weight: 500;">Duration:</span>
                    <span style="color: #8B4513; font-weight: 600;">${quote.duration} days</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                    <span style="color: #666; font-weight: 500;">Travelers:</span>
                    <span style="color: #8B4513; font-weight: 600;">${quote.participants} people</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 20px 0; background: rgba(218, 165, 32, 0.1); margin: 15px -15px -15px -15px; padding: 20px 15px; border-radius: 8px;">
                    <span style="color: #8B4513; font-weight: 600; font-size: 18px;">Total Price:</span>
                    <span style="color: #DAA520; font-size: 28px; font-weight: bold;">${formattedPrice}</span>
                  </div>
                </div>
                ${quote.admin_notes ? `
                  <div style="margin-top: 25px; padding: 20px; background: rgba(139, 69, 19, 0.05); border-radius: 8px; border: 1px solid rgba(139, 69, 19, 0.1);">
                    <p style="margin: 0; color: #8B4513; font-weight: 500; margin-bottom: 8px;">Special Notes:</p>
                    <p style="margin: 0; color: #666; line-height: 1.5;">${quote.admin_notes}</p>
                  </div>
                ` : ''}
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 35px 0;">
                <h3 style="color: #8B4513; font-size: 20px; margin-bottom: 25px;">Ready to Book Your Peru Adventure?</h3>
                
                <div style="background: #f8f8f8; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                  <p style="color: #666; margin-bottom: 20px; font-size: 15px;">Choose your next step:</p>
                  
                  <div style="margin-bottom: 15px;">
                    <a href="${signupLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #DAA520, #B8860B); color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3); transition: all 0.3s ease;">
                      🆕 Create New Account
                    </a>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <a href="${baseUrl}/auth/signin?quote_token=${token}" 
                       style="display: inline-block; background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3); transition: all 0.3s ease;">
                      🔐 Sign In to Existing Account
                    </a>
                  </div>
                  
                  <p style="font-size: 13px; color: #888; margin-top: 15px; font-style: italic;">
                    Already have an account? Use "Sign In". New to Meridian Travel? Use "Create New Account".
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #f8f5f0, #f0f0f0); padding: 30px; text-align: center; border-top: 3px solid #DAA520;">
              <div style="margin-bottom: 20px;">
                <img src="${baseUrl}/logo.png" alt="Meridian Luxury Travel" 
                     style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; display: block; object-fit: cover; border: 2px solid rgba(139, 69, 19, 0.2);"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <!-- Fallback if logo doesn't load -->
                <div style="background: rgba(139, 69, 19, 0.1); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; display: none; align-items: center; justify-content: center;">
                  <div style="color: #8B4513; font-size: 24px; font-weight: bold;">M</div>
                </div>
                <h4 style="color: #8B4513; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">Meridian Luxury Travel</h4>
                <p style="color: #666; margin: 0; font-size: 16px; font-weight: 500;">Your Peru Adventure Specialists</p>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666; line-height: 1.5;">
                <p style="margin: 0 0 8px 0;">🔒 This secure link will automatically attach your quote to your account.</p>
                <p style="margin: 0 0 15px 0;">💬 Questions? Simply reply to this email - we're here to help!</p>
                <p style="margin: 0; font-size: 12px; color: #888;">
                  ✈️ Discover Peru • 🏔️ Luxury Experiences • 📸 Unforgettable Memories
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_baftfqmj_3jQHaPtCBRjgphPzso9kUHj5',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'quotes@meridianluxury.travel',
        to: [quote.contact_email],
        subject: emailSubject,
        html: emailContent,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Email sending failed:', emailError);
      console.error('Email response status:', emailResponse.status);
      return NextResponse.json(
        { error: 'Failed to send email notification', details: emailError, status: emailResponse.status },
        { status: 500 }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult.id);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      signupLink, // For testing purposes
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

// Fallback token generation if database function fails
function generateFallbackToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}