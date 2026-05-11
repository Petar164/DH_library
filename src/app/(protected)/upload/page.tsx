import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UploadForm } from '@/components/upload/UploadForm'
import { Folder } from '@/types'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['contributor', 'admin'].includes(profile.role)) redirect('/library')

  const { data: folders } = await supabase
    .from('folders')
    .select('id, name, type, cover_image_url')
    .order('name', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-[10px] tracking-[0.3em] uppercase text-[#888888] mb-2 font-mono">Contribute</h1>
        <p className="text-xl font-medium">Upload to Archive</p>
      </div>
      <UploadForm folders={(folders ?? []) as Pick<Folder, 'id' | 'name' | 'type'>[]} />
    </div>
  )
}
