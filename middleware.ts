import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth check for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('adminToken')?.value;
    if (adminToken !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
