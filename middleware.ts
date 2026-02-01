import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/auth');
  const isPublicPage = pathname === '/';
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isPublicApiRoute = pathname.startsWith('/api/public');
  const isDbSetupRoute = pathname.startsWith('/api/db/setup');

  // Allow public pages, auth API routes, and setup routes
  if (isPublicPage || isApiAuthRoute || isPublicApiRoute || isDbSetupRoute) {
    return NextResponse.next();
  }

  // Redirect to login if no session and trying to access protected route
  if (!sessionCookie && !isAuthPage) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if logged in and trying to access auth pages
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
