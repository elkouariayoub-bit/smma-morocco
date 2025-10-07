import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/composer',
  '/analytics',
  '/drafts',
  '/queue',
  '/settings',
  '/help',
]

function needsProtection(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const hasCodeSession = req.cookies.get('code-auth')?.value === 'true'
  const isAuthenticated = Boolean(session) || hasCodeSession
  const { pathname, search } = req.nextUrl

  if (!isAuthenticated && needsProtection(pathname)) {
    const loginUrl = new URL('/login', req.url)
    const nextPath = `${pathname}${search}`
    loginUrl.searchParams.set('next', nextPath)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isAuthenticated && pathname === '/login' && !req.nextUrl.searchParams.has('next')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
