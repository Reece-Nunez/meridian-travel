import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { ItineraryDay, ItineraryActivity, ItineraryImage } from '@/types/database';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Check if user has admin role
    const adminProfile = await requireAdmin();
    if (!adminProfile) {
      console.log('Itinerary API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Itinerary API: Received request body:', JSON.stringify(body, null, 2));

    const { day } = body;

    if (!day) {
      return NextResponse.json({ error: 'Day data is required' }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    
    // Start a transaction-like operation
    let savedDay: any;
    
    // Save or update day
    if (day.id) {
      // Update existing day
      const { data: dayData, error: dayError } = await supabaseAdmin
        .from('itinerary_days')
        .update({
          day_label: day.day_label,
          start_date: day.start_date,
          end_date: day.end_date,
          city: day.city,
          description: day.description,
          accommodation: day.accommodation,
          display_order: day.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', day.id)
        .select()
        .single();

      if (dayError) {
        console.error('Itinerary API: Error updating day:', dayError);
        return NextResponse.json({ error: 'Failed to update day' }, { status: 500 });
      }

      savedDay = dayData;
    } else {
      // Create new day
      const { data: dayData, error: dayError } = await supabaseAdmin
        .from('itinerary_days')
        .insert({
          quote_id: day.quote_id,
          day_label: day.day_label,
          start_date: day.start_date,
          end_date: day.end_date,
          city: day.city,
          description: day.description,
          accommodation: day.accommodation,
          display_order: day.display_order
        })
        .select()
        .single();

      if (dayError) {
        console.error('Itinerary API: Error creating day:', dayError);
        return NextResponse.json({ error: 'Failed to create day' }, { status: 500 });
      }

      savedDay = dayData;
    }

    const dayId = savedDay.id;

    // Delete existing activities and images for this day (simpler than complex updates)
    if (day.id) {
      await supabaseAdmin.from('itinerary_activities').delete().eq('day_id', dayId);
      await supabaseAdmin.from('itinerary_images').delete().eq('day_id', dayId);
    }

    // Save activities
    if (day.activities && day.activities.length > 0) {
      const activitiesToInsert = day.activities.map((activity: any) => ({
        day_id: dayId,
        activity_type: activity.activity_type,
        custom_type: activity.custom_type,
        name: activity.name,
        description: activity.description,
        display_order: activity.display_order
      }));

      const { error: activitiesError } = await supabaseAdmin
        .from('itinerary_activities')
        .insert(activitiesToInsert);

      if (activitiesError) {
        console.error('Itinerary API: Error saving activities:', activitiesError);
        return NextResponse.json({ error: 'Failed to save activities' }, { status: 500 });
      }
    }

    // Save images
    if (day.images && day.images.length > 0) {
      const imagesToInsert = day.images
        .filter((image: any) => image.image_url) // Only save images with URLs (uploaded)
        .map((image: any) => ({
          day_id: dayId,
          image_url: image.image_url,
          alt_text: image.alt_text,
          display_order: image.display_order
        }));

      if (imagesToInsert.length > 0) {
        const { error: imagesError } = await supabaseAdmin
          .from('itinerary_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Itinerary API: Error saving images:', imagesError);
          return NextResponse.json({ error: 'Failed to save images' }, { status: 500 });
        }
      }
    }

    console.log('Itinerary API: Successfully saved day with ID:', dayId);
    
    return NextResponse.json({ 
      success: true, 
      day: savedDay,
      message: 'Day saved successfully' 
    });

  } catch (error) {
    console.error('Itinerary API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// GET endpoint to fetch itinerary for a quote
export async function GET(request: NextRequest) {
  try {
    // Check if user has admin role
    const adminProfile = await requireAdmin();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('quote_id');

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    
    const { data: itineraryData, error } = await supabaseAdmin
      .from('itinerary_days')
      .select(`
        *,
        itinerary_activities(*),
        itinerary_images(*)
      `)
      .eq('quote_id', quoteId)
      .order('display_order');

    if (error) {
      console.error('Itinerary API: Error fetching itinerary:', error);
      return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
    }

    return NextResponse.json({ itinerary: itineraryData || [] });

  } catch (error) {
    console.error('Itinerary API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}