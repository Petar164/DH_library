import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MediaGrid } from '@/components/library/MediaGrid'
import { ChevronLeft } from 'lucide-react'

export default async function CelebrityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: celebrity } = await supabase.from('celebrities').select('*').eq('id', id).single()
  if (!celebrity) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('*, uploader:profiles(username, avatar_url), season:seasons(name, period, year, brand)')
    .eq('celebrity_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/library?view=celebrities"
        className="inline-flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black mb-10 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> Celebrities
      </Link>

      <div className="flex items-start gap-6 mb-10 border-b border-zinc-200 pb-8">
        {celebrity.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celebrity.cover_image_url}
            alt={celebrity.name}
            className="w-20 h-20 object-cover flex-shrink-0 media-img pointer-events-none"
            draggable={false}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{celebrity.name}</h1>
          {celebrity.bio && (
            <p className="text-sm text-zinc-500 mt-2 max-w-xl leading-relaxed">{celebrity.bio}</p>
          )}
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 mt-3">{media?.length ?? 0} items</p>
        </div>
      </div>

      <MediaGrid media={media || []} showSeason />
    </div>
  )
}
