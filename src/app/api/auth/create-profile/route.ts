import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { id, username, full_name, bio } = await request.json()

  if (!id || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { error: userError } = await supabase.auth.admin.getUserById(id)
  if (userError) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { error } = await supabase.from('profiles').insert({
    id,
    username: username.toLowerCase().trim(),
    full_name: full_name?.trim() || null,
    bio: bio?.trim() || null,
    role: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: error.code === '23505' ? 'Username already taken' : error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
