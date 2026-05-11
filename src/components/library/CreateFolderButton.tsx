'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FolderType } from '@/types'

const TYPE_OPTIONS: { value: FolderType; label: string }[] = [
  { value: 'season', label: 'Season' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'piece', label: 'Piece' },
  { value: 'magazine_scan', label: 'Magazine Scan' },
  { value: 'promo', label: 'Promo / Advertisement' },
]

export function CreateFolderButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<FolderType>('season')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, type }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error); setLoading(false); return }

    setOpen(false)
    setName('')
    setDescription('')
    setType('season')
    setLoading(false)
    router.push(`/library/folders/${data.id}`)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-mono"
      >
        <Plus className="w-3 h-3" /> New Folder
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-sm p-8 relative border border-zinc-200">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-zinc-300 hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8 font-mono">New Folder</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              <Input id="folderName" label="Name" placeholder="—" value={name} onChange={e => setName(e.target.value)} required />

              {/* Type selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500 font-mono">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`text-[9px] tracking-[0.15em] uppercase py-2.5 px-3 border font-mono text-left transition-colors ${
                        type === opt.value
                          ? 'bg-black text-white border-black'
                          : 'border-zinc-300 text-zinc-500 hover:border-black hover:text-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input id="folderDesc" label="Description (optional)" placeholder="—" value={description} onChange={e => setDescription(e.target.value)} />
              {error && <p className="text-[10px] text-red-500 font-mono">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">Create</Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
