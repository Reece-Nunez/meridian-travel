import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('API /quotes: POST request received');
    
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API /quotes: Missing required environment variables', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
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
      combinedRequirements += `, ${children} children`;
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
      participants: parseInt(adults || '0') + parseInt(children || '0'),
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