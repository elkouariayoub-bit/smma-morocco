import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'
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

let hasWarnedMissingSupabaseEnv = false

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let session: Session | null = null

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!hasWarnedMissingSupabaseEnv) {
      const message =
        'Supabase environment variables are missing. Authentication checks in middleware are being skipped.'
      if (process.env.NODE_ENV !== 'production') {
        console.warn(message)
      } else {
        console.error(message)
      }
      hasWarnedMissingSupabaseEnv = true
    }
  } else {
    try {
      const supabase = createMiddlewareClient(
        { req, res },
        {
          supabaseUrl,
          supabaseKey: supabaseAnonKey,
        },
      )
      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession()
      session = supabaseSession
    } catch (error) {
      console.error('Failed to retrieve Supabase session in middleware', error)
    }
  }

  const hasCodeSession = req.cookies.get('code-auth')?.value === 'true'
  const isAuthenticated = Boolean(session) || hasCodeSession
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
