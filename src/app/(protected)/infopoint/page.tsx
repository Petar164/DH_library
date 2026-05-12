import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BulletinBoard } from '@/components/infopoint/BulletinBoard'
import { NoteData } from '@/components/infopoint/NoteCard'

export default async function InfopointPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: notes } = await supabase
    .from('infopoint_notes')
    .select('*')
    .order('created_at', { ascending: false })

  const mapped: NoteData[] = (notes ?? []).map(n => ({
    id: n.id,
    title: n.title,
    content: n.content,
    tag: n.tag,
    color: n.color,
    rotation: n.rotation,
    animDelay: n.anim_delay,
    animDuration: n.anim_duration,
  }))

  return <BulletinBoard notes={mapped} isAdmin={isAdmin} />
}
