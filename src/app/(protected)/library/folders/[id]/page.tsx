import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MediaGrid } from '@/components/library/MediaGrid'
import { DeleteFolderButton } from '@/components/library/DeleteFolderButton'
import { EditFolderButton } from '@/components/library/EditFolderButton'
import { Media } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  season: 'Season',
  celebrity: 'Celebrity',
  piece: 'Piece',
  magazine_scan: 'Magazine Scan',
  promo: 'Promo',
}

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: folder } = await supabase
    .from('folders')
    .select('*, creator:profiles(username)')
    .eq('id', id)
    .single()

  if (!folder) notFound()

  const { data: folderMedia } = await supabase
    .from('folder_media')
    .select('media:media(*, uploader:profiles(username, avatar_url), season:seasons(name, period, year, brand))')
    .eq('folder_id', id)
    .order('added_at', { ascending: false })

  const media = (folderMedia ?? []).map(fm => fm.media).filter(Boolean) as unknown as Media[]

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isOwner = folder.created_by === user?.id
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black mb-10 transition-colors font-mono"
      >
        <ChevronLeft className="w-3 h-3" /> Library
      </Link>

      <div className="mb-10 border-b border-zinc-200 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-mono mb-1">
              {TYPE_LABELS[folder.type] ?? folder.type}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
            {folder.description && (
              <p className="text-sm text-zinc-500 mt-2 max-w-xl leading-relaxed">{folder.description}</p>
            )}
            <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 mt-3 font-mono">
              {media.length} items · @{(folder.creator as { username: string })?.username}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {(isOwner || isAdmin) && (
              <EditFolderButton folderId={id} currentCover={folder.cover_image_url} media={media} />
            )}
            {(isOwner || isAdmin) && (
              <DeleteFolderButton folderId={id} />
            )}
          </div>
        </div>
      </div>

      <MediaGrid media={media} showSeason />
    </div>
  )
}
