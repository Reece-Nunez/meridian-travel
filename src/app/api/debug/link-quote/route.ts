import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { quoteId, userId, adminEmail } = await request.json();

    // Simple admin check
    if (adminEmail !== 'chris@meridianluxury.travel') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Linking quote:', quoteId, 'to user:', userId);

    const supabaseAdmin = createSupabaseAdmin();

    // Get the quote details first
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('custom_quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote not found:', quoteError);
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    console.log('Found quote for email:', quote.contact_email);

    // Generate a token
    const token = generateFallbackToken();

    // Create quote_token entry
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('quote_tokens')
      .insert({
        quote_id: quoteId,
        user_id: userId,
        token: token,
        email: quote.contact_email
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating quote token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create quote token', details: tokenError.message },
        { status: 500 }
      );
    }

    console.log('Successfully created quote token:', tokenData);

    return NextResponse.json({
      success: true,
      message: 'Quote linked to user successfully',
      quoteToken: tokenData
    });

  } catch (error) {
    console.error('Link quote error:', error);
    return NextResponse.json(
      { error: 'Failed to link quote to user' },
      { status: 500 }
    );
  }
}

// Fallback token generation
function generateFallbackToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}