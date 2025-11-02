import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
})

export function middleware(request: NextRequest) {
  // Apply next-intl middleware
  const response = intlMiddleware(request)

  // Add pathname to headers for layout access
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Clone the response and add custom headers
  const modifiedResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Copy cookies from intl middleware
  response.cookies.getAll().forEach(cookie => {
    modifiedResponse.cookies.set(cookie)
  })

  return modifiedResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
