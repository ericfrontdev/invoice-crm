import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/landing']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Auth API routes
  const isAuthApiRoute = pathname.startsWith('/api/auth')

  if (!isLoggedIn && !isPublicRoute && !isAuthApiRoute) {
    // Redirect to landing page instead of login for root
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/landing', req.url))
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && isPublicRoute && pathname !== '/landing') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
