'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check } from 'lucide-react'
import { Media } from '@/types'

interface EditFolderButtonProps {
  folderId: string
  currentCover: string | null
  media: Media[]
}

export function EditFolderButton({ folderId, currentCover, media }: EditFolderButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(currentCover)
  const [saving, setSaving] = useState(false)

  const images = media.filter(m => m.type === 'image' || m.type === 'scan')

  async function save() {
    setSaving(true)
    await fetch(`/api/folders/${folderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover_image_url: selected }),
    })
    setOpen(false)
    setSaving(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-black transition-colors font-mono"
      >
        <Pencil className="w-3 h-3" /> Edit Cover
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
          <div className="bg-white w-full max-w-lg border border-zinc-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase font-mono">Choose Cover</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-300 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {images.length === 0 ? (
                <p className="text-[10px] text-zinc-400 font-mono text-center py-8">No images in this folder yet.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map(img => (
                    <button
                      key={img.id}
                      onClick={() => setSelected(img.file_url)}
                      className="relative aspect-square overflow-hidden border-2 transition-all"
                      style={{ borderColor: selected === img.file_url ? '#000' : 'transparent' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.file_url} alt="" className="w-full h-full object-cover grayscale pointer-events-none" draggable={false} />
                      {selected === img.file_url && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100">
              <button onClick={() => setOpen(false)} className="text-[10px] tracking-[0.2em] uppercase font-mono text-zinc-400 hover:text-black">Cancel</button>
              <button
                onClick={save}
                disabled={saving}
                className="text-[10px] tracking-[0.2em] uppercase font-mono px-5 py-2 bg-black text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
