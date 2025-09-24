import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('Admin quotes API: Starting request');

    // Basic admin auth check - in production you'd want proper JWT verification
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('admin_email');

    console.log('Admin quotes API: Admin email:', adminEmail);

    // Simple admin check - in production, use proper authentication
    if (adminEmail !== 'chris@meridianluxury.travel') {
      console.log('Admin quotes API: Unauthorized admin email');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Admin quotes API: Environment check:');
    console.log('- SUPABASE_URL configured:', !!supabaseUrl);
    console.log('- SERVICE_ROLE_KEY configured:', !!serviceRoleKey);

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Admin quotes API: Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables' },
        { status: 500 }
      );
    }

    // Use admin client to bypass RLS
    console.log('Admin quotes API: Creating Supabase admin client');
    const supabaseAdmin = createSupabaseAdmin();

    console.log('Admin quotes API: Querying custom_quotes table');
    const { data, error } = await supabaseAdmin
      .from('custom_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin quotes API: Database error:', error);
      console.error('Admin quotes API: Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch quotes', details: error.message },
        { status: 500 }
      );
    }

    console.log('Admin quotes API: Successfully fetched', data?.length || 0, 'quotes');
    return NextResponse.json(data);

  } catch (error) {
    console.error('Admin quotes API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      quoteId,
      status,
      quoted_price,
      quoted_currency,
      admin_notes,
      adult_price,
      child_price,
      adult_count,
      child_count,
      inclusions,
      exclusions,
      adminEmail
    } = body;

    // Simple admin check
    if (adminEmail !== 'chris@meridianluxury.travel') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to update quote
    const supabaseAdmin = createSupabaseAdmin();
    const updateData: any = { updated_at: new Date().toISOString() };

    if (status) updateData.status = status;
    if (quoted_price !== undefined) updateData.quoted_price = quoted_price;
    if (quoted_currency) updateData.quoted_currency = quoted_currency;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (adult_price !== undefined) updateData.adult_price = adult_price;
    if (child_price !== undefined) updateData.child_price = child_price;
    if (adult_count !== undefined) updateData.adult_count = adult_count;
    if (child_count !== undefined) updateData.child_count = child_count;
    if (inclusions !== undefined) updateData.inclusions = inclusions;
    if (exclusions !== undefined) updateData.exclusions = exclusions;

    const { data, error } = await supabaseAdmin
      .from('custom_quotes')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}