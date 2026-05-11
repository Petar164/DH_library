'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatFileSize } from '@/lib/utils'
import { Upload, X, CheckCircle, Plus } from 'lucide-react'
import { Folder, FolderType, MediaType } from '@/types'

interface UploadFormProps {
  folders: Pick<Folder, 'id' | 'name' | 'type'>[]
}

const ACCEPTED = 'image/*,video/*,.pdf'
const MAX_MB = 200

const TYPE_LABELS: Record<FolderType, string> = {
  season: 'Season',
  celebrity: 'Celebrity',
  piece: 'Piece',
  magazine_scan: 'Magazine Scan',
  promo: 'Promo',
}

const FOLDER_TYPE_OPTIONS: { value: FolderType; label: string }[] = [
  { value: 'season', label: 'Season' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'piece', label: 'Piece' },
  { value: 'magazine_scan', label: 'Magazine Scan' },
  { value: 'promo', label: 'Promo / Advertisement' },
]

export function UploadForm({ folders }: UploadFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [titles, setTitles] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>('image')
  const [tags, setTags] = useState('')

  // Folder selection
  const [folderId, setFolderId] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderType, setNewFolderType] = useState<FolderType>('season')
  const [localFolders, setLocalFolders] = useState(folders)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const valid = Array.from(selected).filter(f => f.size <= MAX_MB * 1024 * 1024)
    setFiles(valid)
    setTitles(Array(valid.length).fill(''))
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName.trim(), type: newFolderType }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    const created = { id: data.id, name: data.name, type: data.type as FolderType }
    setLocalFolders(prev => [created, ...prev])
    setFolderId(data.id)
    setCreatingFolder(false)
    setNewFolderName('')
    setNewFolderType('season')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) { setError('Select at least one file'); return }
    if (!folderId) { setError('Choose a folder'); return }
    setUploading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setUploading(false); return }

    let uploaded = 0
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: storageError } = await supabase.storage.from('media').upload(path, file, { upsert: false })
      if (storageError) { setError(storageError.message); setUploading(false); return }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

      const { data: inserted } = await supabase.from('media').insert({
        title: titles[uploaded] || null,
        description: files.length === 1 ? description || null : null,
        type: mediaType,
        file_url: publicUrl,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      }).select('id').single()

      if (inserted) {
        const folderRes = await fetch(`/api/folders/${folderId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId: inserted.id }),
        })
        if (!folderRes.ok) {
          const d = await folderRes.json()
          setError(d.error ?? 'Failed to add file to folder')
          setUploading(false)
          return
        }
      }

      uploaded++
      setProgress(Math.round((uploaded / files.length) * 100))
    }

    setDone(true)
    setUploading(false)
    setTimeout(() => router.push(`/library/folders/${folderId}`), 1500)
  }

  const selectedFolder = localFolders.find(f => f.id === folderId)

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <CheckCircle className="w-8 h-8 text-black" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-mono">Upload complete — redirecting</p>
      </div>
    )
  }

  const labelClass = "text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500 font-mono"
  const selectClass = "bg-transparent border-b border-zinc-400 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors w-full font-mono"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border border-dashed border-zinc-400 p-6 sm:p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-black transition-colors text-center bg-white/50"
      >
        <Upload className="w-5 h-5 text-zinc-300" />
        <p className="text-xs tracking-wide text-zinc-500 font-mono">click or drag files here</p>
        <p className="text-[10px] tracking-wide text-zinc-300 uppercase font-mono">images · videos · pdfs — max {MAX_MB}mb each</p>
        <input ref={fileRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col divide-y divide-zinc-200">
          {files.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono truncate">{f.name}</p>
                  <p className="text-[9px] text-zinc-400 font-mono">{formatFileSize(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFiles(fs => fs.filter((_, j) => j !== i))
                    setTitles(ts => ts.filter((_, j) => j !== i))
                  }}
                  className="text-zinc-300 hover:text-black transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={titles[i] ?? ''}
                onChange={e => setTitles(ts => { const next = [...ts]; next[i] = e.target.value; return next })}
                placeholder="name this file (optional)"
                className="bg-transparent border-b border-zinc-200 focus:border-zinc-400 focus:outline-none text-xs font-mono py-1 text-zinc-700 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          ))}
        </div>
      )}

      {/* Folder picker */}
      <div className="flex flex-col gap-3">
        <label className={labelClass}>Folder <span className="text-red-400">*</span></label>

        {!creatingFolder ? (
          <div className="flex flex-col gap-2">
            <select
              value={folderId}
              onChange={e => setFolderId(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">— select a folder —</option>
              {localFolders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} · {TYPE_LABELS[f.type]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCreatingFolder(true)}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-zinc-400 hover:text-black transition-colors font-mono w-fit"
            >
              <Plus className="w-3 h-3" /> New folder
            </button>
          </div>
        ) : (
          <div className="border border-zinc-300 p-4 flex flex-col gap-4 bg-white/60">
            <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-mono">New Folder</p>
            <Input
              id="newFolderName"
              label="Name"
              placeholder="—"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FOLDER_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewFolderType(opt.value)}
                    className={`text-[9px] tracking-[0.1em] uppercase py-2 px-2 border font-mono text-left transition-colors ${
                      newFolderType === opt.value
                        ? 'bg-black text-white border-black'
                        : 'border-zinc-300 text-zinc-500 hover:border-black hover:text-black'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="text-[10px] tracking-[0.15em] uppercase font-mono px-4 py-2 bg-black text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              >
                Create &amp; Select
              </button>
              <button
                type="button"
                onClick={() => { setCreatingFolder(false); setNewFolderName('') }}
                className="text-[10px] tracking-[0.15em] uppercase font-mono px-4 py-2 border border-zinc-300 text-zinc-400 hover:text-black hover:border-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedFolder && (
          <p className="text-[10px] font-mono text-zinc-400">
            → <span className="text-black">{selectedFolder.name}</span> · {TYPE_LABELS[selectedFolder.type]}
          </p>
        )}
      </div>

      {/* Media type */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Media Type</label>
        <select value={mediaType} onChange={e => setMediaType(e.target.value as MediaType)} className={selectClass}>
          <option value="image">Image</option>
          <option value="scan">Magazine Scan</option>
          <option value="video">Video</option>
          <option value="interview">Interview / Document</option>
        </select>
      </div>

      {/* Description for single file */}
      {files.length === 1 && (
        <Textarea id="description" label="Description (optional)" placeholder="notes, source, context..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      )}

      <Input id="tags" label="Tags — comma separated (optional)" placeholder="runway, backstage, editorial" value={tags} onChange={e => setTags(e.target.value)} />

      {error && <p className="text-[10px] text-red-500 tracking-wide font-mono">{error}</p>}

      {uploading && (
        <div className="flex flex-col gap-2">
          <div className="h-px bg-zinc-200">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-mono">{progress}% uploaded</p>
        </div>
      )}

      <Button type="submit" loading={uploading} disabled={files.length === 0 || !folderId} size="lg">
        Upload {files.length > 1 ? `${files.length} files` : 'file'}
      </Button>
    </form>
  )
}
