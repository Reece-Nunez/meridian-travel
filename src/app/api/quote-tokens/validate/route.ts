import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Get token details with quote information
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('quote_tokens')
      .select(`
        *,
        custom_quotes:quote_id (
          id,
          destination,
          duration,
          participants,
          budget_range,
          quoted_price,
          quoted_currency,
          status,
          contact_email,
          special_requirements
        )
      `)
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    // Return token and quote information
    return NextResponse.json({
      token: tokenData.token,
      email: tokenData.email,
      quote: tokenData.custom_quotes
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Token and userId are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Mark token as used and associate with user
    const { data: updatedToken, error: updateError } = await supabaseAdmin
      .from('quote_tokens')
      .update({
        used_at: new Date().toISOString(),
        user_id: userId
      })
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .select('quote_id')
      .single();

    if (updateError || !updatedToken) {
      return NextResponse.json(
        { error: 'Failed to use token or token already used' },
        { status: 400 }
      );
    }

    // Associate the quote with the user
    const { error: quoteUpdateError } = await supabaseAdmin
      .from('custom_quotes')
      .update({ user_id: userId })
      .eq('id', updatedToken.quote_id);

    if (quoteUpdateError) {
      console.error('Failed to associate quote with user:', quoteUpdateError);
      // Don't fail the request if quote association fails
    }

    return NextResponse.json({
      success: true,
      message: 'Quote successfully attached to your account'
    });

  } catch (error) {
    console.error('Token usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}