'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Media } from '@/types'
import { brandLabel } from '@/lib/utils'
import { Trash2, FileText, Play } from 'lucide-react'

export function ContentRow({ item }: { item: Media }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this item permanently?')) return
    setLoading(true)
    const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else setLoading(false)
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 py-3.5 items-center">
      <div className="w-10 h-10 bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-100">
        {(item.type === 'image' || item.type === 'scan') && item.file_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.file_url} alt="" className="w-full h-full object-cover grayscale pointer-events-none" draggable={false} />
        ) : item.type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <Play className="w-3.5 h-3.5 text-white/40" fill="currentColor" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50">
            <FileText className="w-3.5 h-3.5 text-zinc-300" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{item.title || 'Untitled'}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-400">{item.type}</span>
          {item.brand && <span className="text-[9px] text-zinc-400">{brandLabel(item.brand)}</span>}
          {item.season && <span className="text-[9px] text-zinc-400">{item.season.period}{item.season.year}</span>}
          {item.celebrity && <span className="text-[9px] text-zinc-400">{item.celebrity.name}</span>}
        </div>
      </div>

      <span className="text-[10px] text-zinc-400 hidden sm:block">
        {item.uploader ? `@${item.uploader.username}` : '—'}
      </span>

      <span className="text-[10px] text-zinc-400 hidden sm:block font-mono">
        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </span>

      <button onClick={handleDelete} disabled={loading} className="text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-30">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
