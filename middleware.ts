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

function getSupabaseAuthCookieName(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    return null
  }

  try {
    const { hostname } = new URL(supabaseUrl)
    const projectRef = hostname.split('.')[0]

    if (!projectRef) {
      return null
    }

    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}

function hasSupabaseSessionCookie(req: NextRequest): boolean {
  const cookieName = getSupabaseAuthCookieName()

  if (!cookieName) {
    return false
  }

  const value = req.cookies.get(cookieName)?.value

  if (!value) {
    return false
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value))
    return Boolean(parsed?.access_token)
  } catch {
    return false
  }
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const hasCodeSession = req.cookies.get('code-auth')?.value === 'true'
  const hasSupabaseSession = hasSupabaseSessionCookie(req)
  const isAuthenticated = hasSupabaseSession || hasCodeSession
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
