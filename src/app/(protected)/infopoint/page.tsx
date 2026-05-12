import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BulletinBoard } from '@/components/infopoint/BulletinBoard'

export default async function InfopointPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  return <BulletinBoard isAdmin={isAdmin} />
}
