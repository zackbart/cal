import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }

  try {
    // TODO: Exchange code for access token
    // This will be implemented in Phase 1
    console.log('OAuth callback received:', { code, state });
    
    // For now, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
