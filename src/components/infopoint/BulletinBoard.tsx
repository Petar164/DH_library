'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NoteCard, NoteData, NOTE_TAGS, NoteTag } from './NoteCard'

const NOTE_COLORS: { value: 'white' | 'yellow' | 'gray'; label: string; bg: string }[] = [
  { value: 'white',  label: 'White',  bg: '#FFFFFF' },
  { value: 'yellow', label: 'Yellow', bg: '#FFFFCC' },
  { value: 'gray',   label: 'Gray',   bg: '#DDDDDD' },
]

interface BulletinBoardProps {
  notes: NoteData[]
  isAdmin: boolean
}

export function BulletinBoard({ notes, isAdmin }: BulletinBoardProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag]         = useState<NoteTag | ''>('')
  const [color, setColor]     = useState<'white' | 'yellow' | 'gray'>('white')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError('')

    const res = await fetch('/api/infopoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), tag: tag || null, color }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to create note'); setSaving(false); return }

    setShowModal(false)
    setTitle(''); setContent(''); setTag(''); setColor('white')
    setSaving(false)
    router.refresh()
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2' shape-rendering='crispEdges'%3E%3Crect width='1' height='1' fill='%23000'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23000'/%3E%3C/svg%3E")`,
        backgroundSize: '2px 2px',
        backgroundColor: '#fff',
        imageRendering: 'pixelated',
      }}
    >
      {/* Menu-bar header */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4"
        style={{ height: 20, background: '#fff', borderBottom: '1px solid #000' }}
      >
        <span className="font-[var(--font-pixel)] text-black" style={{ fontSize: 13, WebkitFontSmoothing: 'none', letterSpacing: '0.05em' }}>
          INFOPOINT
        </span>
        <span className="font-[var(--font-pixel)] text-black opacity-50" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>
          {notes.length} notes pinned
        </span>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="font-[var(--font-pixel)] text-black"
            style={{ fontSize: 11, WebkitFontSmoothing: 'none', border: '1px solid #000', padding: '0 6px', background: '#fff', cursor: 'pointer' }}
          >
            + New
          </button>
        )}
      </div>

      {/* Notes */}
      {notes.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <span className="font-[var(--font-pixel)] text-black opacity-30" style={{ fontSize: 14, WebkitFontSmoothing: 'none' }}>
            — board is empty —
          </span>
        </div>
      ) : (
        <div className="p-8 pt-10 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
          {notes.map(note => (
            <div key={note.id} className="break-inside-avoid mb-10 inline-block w-full">
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      )}

      {/* Create modal — Mac OS dialog style */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-md"
            style={{ background: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0 #000', imageRendering: 'pixelated' }}
          >
            {/* Dialog title bar */}
            <div
              className="flex items-center gap-1.5 px-2"
              style={{ height: 20, background: '#000', borderBottom: '1px solid #000' }}
            >
              <div style={{ width: 9, height: 9, border: '1px solid #fff', background: '#000', flexShrink: 0 }} />
              <span className="font-[var(--font-pixel)] text-white" style={{ fontSize: 13, WebkitFontSmoothing: 'none' }}>
                New Note
              </span>
            </div>

            <form onSubmit={handleCreate} className="p-4 flex flex-col gap-3">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>TITLE</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="font-[var(--font-pixel)] text-black w-full px-2 py-1"
                  style={{ fontSize: 13, border: '1px solid #000', outline: 'none', WebkitFontSmoothing: 'none' }}
                />
              </div>

              {/* Tag */}
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>TAG</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value as NoteTag | '')}
                  className="font-[var(--font-pixel)] text-black w-full px-2 py-1"
                  style={{ fontSize: 12, border: '1px solid #000', outline: 'none', background: '#fff', WebkitFontSmoothing: 'none' }}
                >
                  <option value="">— none —</option>
                  {NOTE_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>NOTE COLOR</label>
                <div className="flex gap-2">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className="flex items-center gap-1"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <div style={{
                        width: 16, height: 16,
                        background: c.bg,
                        border: color === c.value ? '2px solid #000' : '1px solid #888',
                      }} />
                      <span className="font-[var(--font-pixel)] text-black" style={{ fontSize: 10, WebkitFontSmoothing: 'none' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>CONTENT</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={7}
                  className="font-[var(--font-pixel)] text-black w-full px-2 py-1 resize-none"
                  style={{ fontSize: 12, lineHeight: '18px', border: '1px solid #000', outline: 'none', WebkitFontSmoothing: 'none' }}
                />
              </div>

              {error && (
                <p className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}>
                  ⚠ {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError('') }}
                  className="font-[var(--font-pixel)] text-black px-4"
                  style={{ fontSize: 12, height: 24, border: '1px solid #000', background: '#fff', cursor: 'pointer', WebkitFontSmoothing: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="font-[var(--font-pixel)] text-white px-4"
                  style={{ fontSize: 12, height: 24, border: '1px solid #000', background: '#000', cursor: saving ? 'wait' : 'pointer', WebkitFontSmoothing: 'none', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Pinning...' : 'Pin Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
