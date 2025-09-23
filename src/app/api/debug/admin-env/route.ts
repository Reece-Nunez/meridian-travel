import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Basic admin auth check
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('admin_email');

    if (adminEmail !== 'chris@meridianluxury.travel') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check all environment variables needed for admin functionality
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET',
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      RESEND_API_KEY: {
        configured: !!process.env.RESEND_API_KEY,
        value: process.env.RESEND_API_KEY ? 'SET' : 'NOT_SET',
        length: process.env.RESEND_API_KEY?.length || 0
      },
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET'
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      runtime: 'server-side',
      message: 'Admin environment debug information'
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}