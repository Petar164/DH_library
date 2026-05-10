'use client'

import { useState } from 'react'
import { Media } from '@/types'
import { MediaLightbox } from './MediaLightbox'
import { brandLabel } from '@/lib/utils'
import { Play, FileText } from 'lucide-react'

interface MediaGridProps {
  media: Media[]
  showSeason?: boolean
}

export function MediaGrid({ media, showSeason }: MediaGridProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (media.length === 0) {
    return (
      <div className="py-24 text-center text-[10px] tracking-[0.25em] uppercase text-zinc-400">
        nothing here yet.
      </div>
    )
  }

  return (
    <>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
        onContextMenu={e => e.preventDefault()}
      >
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelected(index)}
            className="group text-left focus:outline-none"
          >
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative media-protected">
              {item.type === 'image' || item.type === 'scan' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.file_url}
                  alt={item.title || ''}
                  className="w-full h-full object-cover media-img group-hover:scale-[1.04] transition-transform duration-700 pointer-events-none select-none"
                  draggable={false}
                />
              ) : item.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black">
                  <Play className="w-7 h-7 text-white/50" fill="currentColor" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-50">
                  <FileText className="w-7 h-7 text-zinc-300" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-300">Interview</span>
                </div>
              )}

              {(item.type === 'video' || item.type === 'interview') && (
                <div className="absolute top-2 left-2 bg-black text-white text-[8px] tracking-[0.2em] uppercase px-2 py-0.5">
                  {item.type}
                </div>
              )}
            </div>

            {showSeason && item.season && (
              <p className="text-[9px] tracking-wide text-zinc-400 mt-1.5">
                {brandLabel(item.season.brand)} — {item.season.period}{item.season.year}
              </p>
            )}
            {item.title && (
              <p className="text-[10px] mt-1 text-zinc-500 truncate">{item.title}</p>
            )}
          </button>
        ))}
      </div>

      {selected !== null && (
        <MediaLightbox
          media={media}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
