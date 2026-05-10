'use client'

import { useEffect, useState, useCallback } from 'react'
import { Media } from '@/types'
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { brandLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface MediaLightboxProps {
  media: Media[]
  initialIndex: number
  onClose: () => void
}

export function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [showInfo, setShowInfo] = useState(false)
  const [username, setUsername] = useState('')
  const current = media[index]

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
        if (profile) setUsername(profile.username)
      }
    }
    getUser()
  }, [])

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(media.length - 1, i + 1)), [media.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/30 font-mono">
          {index + 1} — {media.length}
        </span>
        <div className="flex items-center gap-5">
          <button onClick={() => setShowInfo(!showInfo)} className="text-white/20 hover:text-white/60 transition-colors">
            <Info className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 py-8">
        {index > 0 && (
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative media-protected select-none">
          {current.type === 'image' || current.type === 'scan' ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.file_url}
                alt={current.title || ''}
                className="max-h-[82vh] max-w-full object-contain select-none pointer-events-none"
                draggable={false}
              />
              {username && (
                <div className="absolute bottom-3 right-3 text-[9px] text-white/20 font-mono tracking-widest select-none pointer-events-none">
                  @{username}
                </div>
              )}
            </div>
          ) : current.type === 'video' ? (
            <video
              src={current.file_url}
              controls
              controlsList="nodownload"
              className="max-h-[82vh] max-w-full"
            />
          ) : (
            <div className="border border-white/10 p-10 max-w-2xl text-white/70 text-sm leading-relaxed">
              <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase mb-5">Interview / Document</p>
              <p>{current.title || 'Untitled'}</p>
            </div>
          )}
        </div>

        {index < media.length - 1 && (
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="border-t border-white/[0.06] px-5 py-3.5 text-[10px] text-white/30 flex flex-wrap gap-6 font-mono tracking-wide">
          {current.title && <span><span className="text-white/15 mr-2">title</span>{current.title}</span>}
          {current.season && <span><span className="text-white/15 mr-2">season</span>{brandLabel(current.season.brand)} {current.season.period}{current.season.year}</span>}
          {current.celebrity && <span><span className="text-white/15 mr-2">celebrity</span>{current.celebrity.name}</span>}
          {current.type && <span><span className="text-white/15 mr-2">type</span>{current.type}</span>}
          {current.uploader && <span><span className="text-white/15 mr-2">via</span>@{current.uploader.username}</span>}
        </div>
      )}
    </div>
  )
}
