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

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  let session = null

  if (supabaseConfigured) {
    const supabase = createMiddlewareClient({ req, res })
    const result = await supabase.auth.getSession()
    session = result.data.session
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[middleware] Supabase credentials are not configured. Skipping auth enforcement for local development.',
    )
  }

  const hasCodeSession = req.cookies.get('code-auth')?.value === 'true'
  const isAuthenticated = supabaseConfigured ? Boolean(session) || hasCodeSession : true
  const { pathname, search } = req.nextUrl

  if (!isAuthenticated && needsProtection(pathname)) {
    const loginUrl = new URL('/login', req.url)
    const nextPath = `${pathname}${search}`
    loginUrl.searchParams.set('next', nextPath)
    loginUrl.searchParams.set('reason', 'redirect')
    return NextResponse.redirect(loginUrl)
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
