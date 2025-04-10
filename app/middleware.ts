import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './api/auth/auth';

export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Skip middleware for public routes
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/profile/:path*',
    '/history/:path*',
    '/outfits/:path*'
  ]
}; 