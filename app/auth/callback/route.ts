import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const userEmail = data.session.user.email!

      // Check if this user already exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, first_name')
        .eq('email', userEmail)
        .single()

      if (!existingUser) {
        // New user — look up their client from the domain registry
        const domain = userEmail.split('@')[1]

        const { data: domainRecord } = await supabase
          .from('client_domains')
          .select('client_id')
          .eq('domain', domain)
          .eq('active', true)
          .single()

        if (domainRecord) {
          // Insert new user record
          await supabase.from('users').insert({
            email: userEmail,
            client_id: domainRecord.client_id
          })
        }

        // Send to first-login to capture their name
        return NextResponse.redirect(`${origin}/first-login`)
      }

      // Returning user — check if name is captured
      if (!existingUser.first_name) {
        return NextResponse.redirect(`${origin}/first-login`)
      }

      // Fully set up user — send to home
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  // Something went wrong — back to login
  return NextResponse.redirect(`${origin}/`)
}
