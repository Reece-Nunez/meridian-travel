import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

async function sendAdminNotification(quote: any) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping admin notification');
    return;
  }

  const adminEmail = 'chris@meridianluxury.travel';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const emailContent = `
    <html>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #F5F5DC;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8B4513, #DAA520); padding: 40px 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🔔 New Quote Request</h1>
            <p style="margin: 15px 0 0 0; font-size: 20px; opacity: 0.95;">A new quote request has been submitted</p>
          </div>

          <!-- Quote Details -->
          <div style="padding: 40px 30px;">
            <div style="background: linear-gradient(135deg, #f8f5f0, #faf8f5); padding: 30px; border-radius: 12px; border-left: 5px solid #DAA520; margin-bottom: 30px;">
              <h2 style="color: #8B4513; margin-top: 0; font-size: 24px; margin-bottom: 25px;">Quote Details</h2>
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
                  <span style="color: #666; font-weight: 500;">Participants:</span>
                  <span style="color: #8B4513; font-weight: 600;">${quote.participants} people</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="color: #666; font-weight: 500;">Budget Range:</span>
                  <span style="color: #8B4513; font-weight: 600;">${quote.budget_range}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="color: #666; font-weight: 500;">Contact Email:</span>
                  <span style="color: #8B4513; font-weight: 600;">${quote.contact_email}</span>
                </div>
                ${quote.contact_phone ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="color: #666; font-weight: 500;">Contact Phone:</span>
                  <span style="color: #8B4513; font-weight: 600;">${quote.contact_phone}</span>
                </div>
                ` : ''}
                ${quote.travel_dates_start ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="color: #666; font-weight: 500;">Travel Dates:</span>
                  <span style="color: #8B4513; font-weight: 600;">${quote.travel_dates_start} to ${quote.travel_dates_end || 'TBD'}</span>
                </div>
                ` : ''}
              </div>
              ${quote.special_requirements ? `
                <div style="margin-top: 25px; padding: 20px; background: rgba(139, 69, 19, 0.05); border-radius: 8px; border: 1px solid rgba(139, 69, 19, 0.1);">
                  <p style="margin: 0; color: #8B4513; font-weight: 500; margin-bottom: 8px;">Special Requirements:</p>
                  <p style="margin: 0; color: #666; line-height: 1.5; white-space: pre-wrap;">${quote.special_requirements}</p>
                </div>
              ` : ''}
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${baseUrl}/admin/quotes/${quote.id}"
                 style="display: inline-block; background: linear-gradient(135deg, #DAA520, #B8860B); color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);">
                Review Quote Request
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #f8f5f0, #f0f0f0); padding: 20px; text-align: center; border-top: 3px solid #DAA520;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Submitted on ${new Date(quote.created_at).toLocaleDateString()} at ${new Date(quote.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'quotes@meridianluxury.travel',
      to: [adminEmail],
      subject: `🔔 New Quote Request: ${quote.destination} for ${quote.participants} people`,
      html: emailContent,
    }),
  });

  if (!emailResponse.ok) {
    const emailError = await emailResponse.text();
    throw new Error(`Failed to send admin notification: ${emailError}`);
  }

  console.log('Admin notification sent successfully');
}

export async function POST(request: Request) {
  try {
    console.log('API /quotes: POST request received');
    
    // Debug environment variables
    const debugInfo = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      availableSupabaseEnvs: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
      totalEnvVars: Object.keys(process.env).length,
      someEnvKeys: Object.keys(process.env).slice(0, 10) // First 10 env var names
    };
    
    console.log('API /quotes: Environment debug info', debugInfo);

    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API /quotes: Missing required environment variables', debugInfo);
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          debug: debugInfo
        },
        { status: 500 }
      );
    }
    
    const data = await request.json();
    console.log('API /quotes: Request data received', { destination: data.destination, email: data.email });
    
    const {
      firstName,
      lastName,
      email,
      phone,
      destination,
      dateType,
      flexibleMonth,
      flexibleYear,
      flexibleDuration,
      exactStartDate,
      exactEndDate,
      adults,
      children,
      childrenOver12,
      rooms,
      budget,
      specialRequirements,
      travelPlans
    } = data;

    // Calculate duration from the form data
    let duration = 7; // Default duration
    let travel_dates_start = null;
    let travel_dates_end = null;

    if (dateType === 'exact' && exactStartDate && exactEndDate) {
      const startDate = new Date(exactStartDate);
      const endDate = new Date(exactEndDate);
      duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      travel_dates_start = exactStartDate;
      travel_dates_end = exactEndDate;
    } else if (dateType === 'flexible' && flexibleDuration) {
      // Use the selected duration for flexible dates
      if (flexibleDuration === 'custom') {
        duration = 7; // Default for custom, admin can adjust
      } else {
        duration = parseInt(flexibleDuration);
      }
    }

    // Combine all additional information
    let combinedRequirements = '';
    
    // Add name information
    if (firstName || lastName) {
      combinedRequirements += `Contact Name: ${firstName} ${lastName}`.trim() + '\n\n';
    }
    
    // Add date preferences
    if (dateType === 'flexible') {
      let flexibleInfo = 'Flexible Dates: ';
      if (flexibleMonth && flexibleYear) {
        flexibleInfo += `${flexibleMonth} ${flexibleYear}`;
      } else if (flexibleMonth) {
        flexibleInfo += `${flexibleMonth} (any year)`;
      } else if (flexibleYear) {
        flexibleInfo += `${flexibleYear} (any month)`;
      } else {
        flexibleInfo += 'Any time';
      }
      
      if (flexibleDuration === 'custom') {
        flexibleInfo += ', Custom duration (to be discussed)';
      } else if (flexibleDuration) {
        const days = parseInt(flexibleDuration);
        flexibleInfo += `, ${days} day${days > 1 ? 's' : ''}`;
      }
      
      combinedRequirements += flexibleInfo + '\n\n';
    }
    
    // Add group details
    combinedRequirements += `Group Details: ${adults} adults`;
    if (parseInt(children) > 0) {
      combinedRequirements += `, ${children} children (under 12)`;
    }
    if (parseInt(childrenOver12) > 0) {
      combinedRequirements += `, ${childrenOver12} children (12 and older)`;
    }
    combinedRequirements += `, ${rooms} room${parseInt(rooms) > 1 ? 's' : ''}\n\n`;
    
    // Add special requirements
    if (specialRequirements) {
      combinedRequirements += `Special Requirements: ${specialRequirements}\n\n`;
    }
    
    // Add travel plans
    if (travelPlans) {
      combinedRequirements += `Travel Plans & Interests: ${travelPlans}`;
    }

    // Prepare data for database with proper type validation
    const quoteData = {
      destination: destination?.toString() || '',
      duration: Number.isInteger(duration) ? duration : 7,
      participants: parseInt(adults || '0') + parseInt(children || '0') + parseInt(childrenOver12 || '0'),
      budget_range: budget?.toString() || '',
      travel_dates_start: travel_dates_start || null,
      travel_dates_end: travel_dates_end || null,
      special_requirements: combinedRequirements.trim() || null,
      contact_email: email?.toString() || '',
      contact_phone: phone?.toString() || '',
      status: 'pending' as const
    };

    // Validate required fields
    if (!quoteData.destination || !quoteData.contact_email) {
      console.error('API /quotes: Missing required fields', {
        hasDestination: !!quoteData.destination,
        hasEmail: !!quoteData.contact_email
      });
      return NextResponse.json(
        { error: 'Missing required fields: destination and email are required' },
        { status: 400 }
      );
    }

    console.log('API /quotes: Prepared quote data', { 
      destination: quoteData.destination, 
      participants: quoteData.participants,
      budget_range: quoteData.budget_range 
    });

    // Insert into database using admin client
    const supabaseAdmin = createSupabaseAdmin();
    console.log('API /quotes: Created Supabase admin client');
    
    const { data: insertedQuote, error } = await supabaseAdmin
      .from('custom_quotes')
      .insert([quoteData])
      .select()
      .single();

    console.log('API /quotes: Database insert result', { 
      success: !error, 
      error: error?.message, 
      quoteId: insertedQuote?.id 
    });

    if (error) {
      console.error('API /quotes: Database error details', { 
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code 
      });
      return NextResponse.json(
        { error: 'Failed to submit quote request', details: error.message },
        { status: 500 }
      );
    }

    console.log('API /quotes: Quote submitted successfully', { quoteId: insertedQuote.id });

    // Send admin notification email
    try {
      await sendAdminNotification(insertedQuote);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the quote creation if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request submitted successfully',
        quoteId: insertedQuote.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('API /quotes: Unexpected error', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}