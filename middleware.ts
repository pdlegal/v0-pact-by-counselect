import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/callback', '/first-login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through without checking session
  if (PUBLIC_ROUTES.some(route => pathname === route)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: request.headers.get('cookie') ?? ''
      }
    }
  })

  const { data: { session } } = await supabase.auth.getSession()

  // No session — redirect to login
  if (!session) {
    const loginUrl = new URL('/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'
  ]
}
