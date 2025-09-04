import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Basic admin auth check - in production you'd want proper JWT verification
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('admin_email');
    
    // Simple admin check - in production, use proper authentication
    if (adminEmail !== 'chris@meridianluxury.travel') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('custom_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, status, quoted_price, quoted_currency, admin_notes, adminEmail } = body;

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