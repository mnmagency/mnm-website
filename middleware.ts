import { NextResponse, type NextRequest } from 'next/server'

/**
 * Locale routing.
 *
 *  English is default and has no URL prefix: /about, /blog, /contact
 *  Arabic is served under /ar/*: /ar/about, /ar/blog, /ar/contact
 *
 * This middleware:
 *  - Strips the /ar prefix from the URL before it reaches the app router
 *  - Sets x-locale: ar on the request so server components can read it
 *
 * That way we get bilingual routing without duplicating every page file.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const newPathname = pathname === '/ar' ? '/' : pathname.replace(/^\/ar/, '')

    const url = request.nextUrl.clone()
    url.pathname = newPathname

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', 'ar')
    requestHeaders.set('x-pathname', pathname)

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
  }

  // English (default) — still set the header so getLocale() always works
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', 'en')
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  // Skip Next.js internals, static files, and API routes
  matcher: [
    '/((?!api/|_next/|_static/|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
}
