import { createClient } from '@/lib/supabase/server'
import { FolderGrid } from '@/components/library/FolderGrid'
import { CreateFolderButton } from '@/components/library/CreateFolderButton'
import { Folder } from '@/types'

export default async function LibraryPage() {
  const supabase = await createClient()

  const { data: folders } = await supabase
    .from('folders')
    .select('*, creator:profiles(username), media_count:folder_media(count)')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const canCreate = ['contributor', 'admin'].includes(profile?.role ?? '')

  const normalised: Folder[] = (folders ?? []).map(f => ({
    ...f,
    media_count: (f.media_count as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-500">Browse</h1>
        {canCreate && <CreateFolderButton />}
      </div>
      <FolderGrid folders={normalised} />
    </div>
  )
}
