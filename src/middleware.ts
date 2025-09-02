import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Check if the route is admin route (but not login pages)
  if (req.nextUrl.pathname.startsWith('/admin') && 
      !req.nextUrl.pathname.startsWith('/admin/login')) {
    // For now, let client-side handle auth
    // Could add cookie check here if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};