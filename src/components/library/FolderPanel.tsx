'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Loader } from 'lucide-react'

interface FolderPanelProps {
  mediaId: string
  onClose: () => void
}

interface FolderItem {
  id: string
  name: string
  hasMedia: boolean
}

export function FolderPanel({ mediaId, onClose }: FolderPanelProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [fRes, fmRes] = await Promise.all([
        fetch('/api/folders'),
        fetch(`/api/folders/for-media/${mediaId}`),
      ])
      const [allFolders, mediaFolders] = await Promise.all([fRes.json(), fmRes.json()])
      const mediaFolderIds = new Set((mediaFolders as { folder_id: string }[]).map(f => f.folder_id))
      setFolders((allFolders as { id: string; name: string }[]).map(f => ({ ...f, hasMedia: mediaFolderIds.has(f.id) })))
      setLoading(false)
    }
    load()
  }, [mediaId])

  async function toggle(folder: FolderItem) {
    setPending(folder.id)
    const method = folder.hasMedia ? 'DELETE' : 'POST'
    await fetch(`/api/folders/${folder.id}/media`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId }),
    })
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, hasMedia: !f.hasMedia } : f))
    setPending(null)
  }

  async function createAndAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const folder = await res.json()
    if (res.ok) {
      await fetch(`/api/folders/${folder.id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      })
      setFolders(prev => [{ id: folder.id, name: folder.name, hasMedia: true }, ...prev])
      setNewName('')
    }
    setCreating(false)
  }

  return (
    <div className="absolute inset-0 z-10 bg-black/90 flex flex-col" onClick={onClose}>
      <div
        className="mt-auto border-t border-white/10 bg-black p-5 max-h-[60vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-4 font-mono">Save to folder</p>

        {loading ? (
          <Loader className="w-4 h-4 text-white/20 animate-spin" />
        ) : (
          <div className="flex flex-col gap-1 mb-5">
            {folders.length === 0 && (
              <p className="text-[10px] text-white/20 font-mono">No folders yet.</p>
            )}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => toggle(folder)}
                disabled={pending === folder.id}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.06] text-left disabled:opacity-50"
              >
                <span className="text-sm text-white/70 font-mono">{folder.name}</span>
                {pending === folder.id ? (
                  <Loader className="w-3.5 h-3.5 text-white/30 animate-spin" />
                ) : folder.hasMedia ? (
                  <Check className="w-3.5 h-3.5 text-white/60" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-white/20" />
                )}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={createAndAdd} className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New folder name..."
            className="flex-1 bg-white/5 border border-white/10 text-white text-[11px] font-mono px-3 py-2 focus:outline-none focus:border-white/30 placeholder:text-white/20"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-colors disabled:opacity-30"
          >
            {creating ? '...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  )
}
