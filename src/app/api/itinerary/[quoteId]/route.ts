import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const resolvedParams = await params;

    // Fetch itinerary days with their activities and images
    const { data: days, error: daysError } = await supabaseAdmin
      .from('itinerary_days')
      .select(`
        *,
        activities:itinerary_activities(*),
        images:itinerary_images(*)
      `)
      .eq('quote_id', resolvedParams.quoteId)
      .order('display_order', { ascending: true });

    if (daysError) {
      console.error('Error fetching itinerary days:', daysError);
      return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
    }

    // Sort activities and images by display_order
    const processedDays = days?.map(day => ({
      ...day,
      activities: day.activities?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
      images: day.images?.sort((a: any, b: any) => a.display_order - b.display_order) || []
    })) || [];

    return NextResponse.json(processedDays);
  } catch (error) {
    console.error('Itinerary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}