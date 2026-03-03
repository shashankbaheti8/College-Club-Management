import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback handler — exchanges the code from Supabase email links
 * (e.g., password reset, email confirmation) for a session.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If the redirect target is the reset-password page, go there
      // Otherwise go to the default 'next' destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, redirect to login with an error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Something went wrong. Please try again.')}`
  )
}
