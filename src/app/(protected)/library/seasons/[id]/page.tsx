import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { brandLabel } from '@/lib/utils'
import { MediaGrid } from '@/components/library/MediaGrid'
import { ChevronLeft } from 'lucide-react'

export default async function SeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: season } = await supabase.from('seasons').select('*').eq('id', id).single()
  if (!season) notFound()

  const { data: media } = await supabase
    .from('media')
    .select('*, uploader:profiles(username, avatar_url)')
    .eq('season_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black mb-10 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> Library
      </Link>

      <div className="mb-10 border-b border-zinc-200 pb-8">
        <p className="text-[9px] tracking-[0.3em] uppercase text-zinc-400 mb-2">{brandLabel(season.brand)}</p>
        <h1 className="text-3xl font-bold tracking-tight">{season.period} {season.year}</h1>
        {season.description && (
          <p className="text-sm text-zinc-500 mt-3 max-w-xl leading-relaxed">{season.description}</p>
        )}
        <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 mt-4">
          {media?.length ?? 0} items
        </p>
      </div>

      <MediaGrid media={media || []} />
    </div>
  )
}
