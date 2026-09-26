import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-server'

const PUBLIC_ROUTES = ['/', '/auth/callback', '/first-login', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Allow public routes through without checking session
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response
  }

  // Check session server-side
  const supabase = createMiddlewareClient(request, response)

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  } catch {
    // If session check fails, allow through rather than redirect looping
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'
  ]
}
