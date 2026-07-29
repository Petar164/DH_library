import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Landing point for emailed auth links (password recovery, email confirmation).
// Exchanges the one-time token for a session cookie, then hands off to `next`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  const nextParam = searchParams.get('next')
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/library'

  const supabase = await createClient()

  // Template-driven flow: ?token_hash=...&type=recovery
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }

  // PKCE flow: ?code=...
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }

  // No usable token, or it was already spent / expired.
  return NextResponse.redirect(new URL('/forgot-password?error=expired', origin))
}
