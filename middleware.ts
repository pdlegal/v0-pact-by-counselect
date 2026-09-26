import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-server'

const PUBLIC_ROUTES = ['/', '/auth/callback', '/first-login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Allow public routes through without checking session
  if (PUBLIC_ROUTES.some(route => pathname === route)) {
    return response
  }

  // Check session server-side
  const supabase = createMiddlewareClient(request, response)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No session — redirect to login
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'
  ]
}
