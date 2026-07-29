import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

// Readable one-off password: no look-alike characters, safe to read out loud.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

function tempPassword() {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  const body = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
  return `archive-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const password = tempPassword()

  const admin = await createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Shown to the admin once, to pass to the member out of band.
  return NextResponse.json({ password })
}
