import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected (dashboard routes)
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  if (isProtectedRoute) {
    // Check for Stack Auth session cookie
    const stackSession = request.cookies.get('stack-session')?.value;
    
    if (!stackSession) {
      // Redirect to Stack Auth sign-in if no session
      return NextResponse.redirect(new URL('/handler/sign-in', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
