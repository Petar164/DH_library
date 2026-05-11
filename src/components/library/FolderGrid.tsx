'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import { Folder, FolderType } from '@/types'

const TYPE_LABELS: Record<FolderType, string> = {
  season: 'Season',
  celebrity: 'Celebrity',
  piece: 'Piece',
  magazine_scan: 'Magazine Scan',
  promo: 'Promo',
}

export function FolderGrid({ folders }: { folders: Folder[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<FolderType | 'all'>('all')

  const availableTypes = [...new Set(folders.map(f => f.type))] as FolderType[]

  const filtered = folders.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || f.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div>
      {/* Search + filter — only shown when folders exist */}
      {folders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search folders..."
              className="w-full h-10 pl-10 pr-4 border border-zinc-300 bg-white/80 text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
          {availableTypes.length > 1 && (
            <div className="relative flex-shrink-0">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as FolderType | 'all')}
                className="appearance-none h-10 border border-zinc-300 bg-white/80 text-[10px] font-mono uppercase tracking-[0.15em] pl-3 pr-8 focus:outline-none focus:border-black w-full sm:w-auto"
              >
                <option value="all">All Types</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-mono">
          {folders.length === 0 ? 'no folders yet.' : 'no results.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(folder => (
            <Link key={folder.id} href={`/library/folders/${folder.id}`} className="group flex flex-col">
              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-2 relative border border-zinc-200">
                {folder.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={folder.cover_image_url}
                    alt={folder.name}
                    className="w-full h-full object-cover media-img group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-400 font-mono px-2 text-center">
                      {TYPE_LABELS[folder.type]}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <p className="text-sm font-semibold tracking-tight truncate leading-snug">{folder.name}</p>
              <p className="text-[8px] tracking-[0.2em] uppercase text-zinc-400 font-mono mt-0.5">
                {TYPE_LABELS[folder.type]} · {folder.media_count ?? 0} items
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
