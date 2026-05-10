'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatFileSize, brandLabel } from '@/lib/utils'
import { Upload, X, CheckCircle } from 'lucide-react'
import { SeasonRecord, Celebrity, Brand, MediaType } from '@/types'

interface UploadFormProps {
  seasons: Pick<SeasonRecord, 'id' | 'name' | 'period' | 'year' | 'brand'>[]
  celebrities: Pick<Celebrity, 'id' | 'name'>[]
}

const ACCEPTED = 'image/*,video/*,.pdf'
const MAX_MB = 200

export function UploadForm({ seasons, celebrities }: UploadFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<MediaType>('image')
  const [brand, setBrand] = useState<Brand | ''>('')
  const [seasonId, setSeasonId] = useState('')
  const [celebrityId, setCelebrityId] = useState('')
  const [tags, setTags] = useState('')

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    setFiles(Array.from(selected).filter(f => f.size <= MAX_MB * 1024 * 1024))
  }

  function removeFile(index: number) {
    setFiles(f => f.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) { setError('Select at least one file'); return }
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

      await supabase.from('media').insert({
        title: files.length === 1 ? title || null : null,
        description: files.length === 1 ? description || null : null,
        type,
        file_url: publicUrl,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        season_id: seasonId || null,
        celebrity_id: celebrityId || null,
        brand: brand || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        uploaded_by: user.id,
      })

      uploaded++
      setProgress(Math.round((uploaded / files.length) * 100))
    }

    setDone(true)
    setUploading(false)
    setTimeout(() => router.push(seasonId ? `/library/seasons/${seasonId}` : '/library'), 1500)
  }

  const filteredSeasons = brand ? seasons.filter(s => s.brand === brand) : seasons

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <CheckCircle className="w-8 h-8 text-black" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-400">Upload complete — redirecting</p>
      </div>
    )
  }

  const selectClass = "bg-transparent border-b border-zinc-400 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors w-full"
  const labelClass = "text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border border-dashed border-zinc-400 p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-black transition-colors text-center bg-white/50"
      >
        <Upload className="w-5 h-5 text-zinc-300" />
        <p className="text-xs tracking-wide text-zinc-500">click or drag files here</p>
        <p className="text-[10px] tracking-wide text-zinc-300 uppercase">images · videos · pdfs — max {MAX_MB}mb each</p>
        <input ref={fileRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col divide-y divide-zinc-200">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs font-medium truncate max-w-xs">{f.name}</p>
                <p className="text-[9px] text-zinc-400 tracking-wide">{formatFileSize(f.size)}</p>
              </div>
              <button type="button" onClick={() => removeFile(i)} className="text-zinc-300 hover:text-black transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as MediaType)} className={selectClass}>
            <option value="image">Image</option>
            <option value="scan">Magazine Scan</option>
            <option value="video">Video</option>
            <option value="interview">Interview</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Brand</label>
          <select value={brand} onChange={e => { setBrand(e.target.value as Brand | ''); setSeasonId('') }} className={selectClass}>
            <option value="">— select —</option>
            <option value="dior_homme">Dior Homme</option>
            <option value="saint_laurent">Saint Laurent</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Season</label>
          <select value={seasonId} onChange={e => setSeasonId(e.target.value)} className={selectClass}>
            <option value="">— none —</option>
            {filteredSeasons.map(s => (
              <option key={s.id} value={s.id}>{brandLabel(s.brand)} — {s.period}{s.year}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Celebrity</label>
          <select value={celebrityId} onChange={e => setCelebrityId(e.target.value)} className={selectClass}>
            <option value="">— none —</option>
            {celebrities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {files.length === 1 && (
        <div className="flex flex-col gap-6">
          <Input id="title" label="Title (optional)" placeholder="—" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea id="description" label="Description (optional)" placeholder="notes, source, context..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
      )}

      <Input id="tags" label="Tags — comma separated (optional)" placeholder="runway, backstage, editorial" value={tags} onChange={e => setTags(e.target.value)} />

      {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}

      {uploading && (
        <div className="flex flex-col gap-2">
          <div className="h-px bg-zinc-200">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400">{progress}% uploaded</p>
        </div>
      )}

      <Button type="submit" loading={uploading} disabled={files.length === 0} size="lg">
        Upload {files.length > 1 ? `${files.length} files` : 'file'}
      </Button>
    </form>
  )
}
