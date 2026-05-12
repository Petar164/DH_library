import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('infopoint_notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const rotation = (Math.random() * 6 - 3).toFixed(2)
  const animDelay = (Math.random() * 2).toFixed(2)
  const animDuration = (3.5 + Math.random() * 2).toFixed(2)

  const { data, error } = await supabase.from('infopoint_notes').insert({
    title: body.title,
    content: body.content,
    tag: body.tag || null,
    color: body.color || 'white',
    rotation: parseFloat(rotation),
    anim_delay: parseFloat(animDelay),
    anim_duration: parseFloat(animDuration),
    created_by: user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
