import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/signup']
  
  // Skip auth check for public assets and paths
  if (
    pathname.startsWith('/images') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico') ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // Auth check for protected routes
  if (!authToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Store the original URL to redirect back after login
    const response = NextResponse.redirect(url)
    response.cookies.set('redirect_after_login', pathname)
    return response
  }

  // Redirect authenticated users away from auth pages
  if (authToken && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 