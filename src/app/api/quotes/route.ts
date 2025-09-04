import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
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

    // Prepare data for database
    const quoteData = {
      destination,
      duration,
      participants: parseInt(adults) + parseInt(children),
      budget_range: budget,
      travel_dates_start,
      travel_dates_end,
      special_requirements: combinedRequirements.trim() || null,
      contact_email: email,
      contact_phone: phone,
      status: 'pending' as const
    };

    // Insert into database using admin client
    const supabaseAdmin = createSupabaseAdmin();
    const { data: insertedQuote, error } = await supabaseAdmin
      .from('custom_quotes')
      .insert([quoteData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit quote request' },
        { status: 500 }
      );
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
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}