'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NoteCard, NoteData, NOTE_TAGS, NoteTag } from './NoteCard'

const NOTE_COLORS: { value: 'white' | 'yellow' | 'gray'; label: string; bg: string }[] = [
  { value: 'white',  label: 'White',  bg: '#FFFFFF' },
  { value: 'yellow', label: 'Yellow', bg: '#FFFFCC' },
  { value: 'gray',   label: 'Gray',   bg: '#DDDDDD' },
]

const px: React.CSSProperties = { WebkitFontSmoothing: 'none' as const }

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

  function openModal() { setShowModal(true); setError('') }
  function closeModal() { setShowModal(false); setTitle(''); setContent(''); setTag(''); setColor('white'); setError('') }

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
    if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
    setSaving(false)
    closeModal()
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
      {/* Header — taller on mobile for tap comfort */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4"
        style={{ height: 36, background: '#fff', borderBottom: '1px solid #000' }}
      >
        <span className="font-[var(--font-pixel)] text-black" style={{ fontSize: 14, ...px, letterSpacing: '0.05em' }}>
          INFOPOINT
        </span>
        <span className="font-[var(--font-pixel)] text-black opacity-40 hidden sm:block" style={{ fontSize: 11, ...px }}>
          {notes.length} notes pinned
        </span>
        {isAdmin && (
          <button
            onClick={openModal}
            className="font-[var(--font-pixel)] text-white active:opacity-70"
            style={{ fontSize: 13, ...px, border: '1px solid #000', padding: '4px 12px', background: '#000', cursor: 'pointer', minHeight: 28 }}
          >
            + New
          </button>
        )}
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 px-8 text-center">
          <span className="font-[var(--font-pixel)] text-black opacity-30" style={{ fontSize: 14, ...px }}>
            — board is empty —
          </span>
          {isAdmin && (
            <button
              onClick={openModal}
              className="font-[var(--font-pixel)] text-white"
              style={{ fontSize: 13, ...px, border: '1px solid #000', padding: '6px 16px', background: '#000', cursor: 'pointer' }}
            >
              Pin the first note
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 sm:p-8 pt-6 sm:pt-10 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 sm:gap-10">
          {notes.map(note => (
            <div key={note.id} className="break-inside-avoid mb-6 sm:mb-10 inline-block w-full">
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      )}

      {/* Create modal — slides up from bottom on mobile, centered on desktop */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full sm:max-w-md sm:mx-4"
            style={{
              background: '#fff',
              border: '2px solid #000',
              boxShadow: '4px 4px 0 #000',
              imageRendering: 'pixelated',
              /* full width sheet on mobile, rounded-ish top edge via border */
              borderBottom: 'none',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-3"
              style={{ height: 32, background: '#000', borderBottom: '1px solid #000' }}
            >
              <div style={{ width: 10, height: 10, border: '1px solid #fff', background: '#000', flexShrink: 0 }} />
              <span className="font-[var(--font-pixel)] text-white flex-1" style={{ fontSize: 14, ...px }}>New Note</span>
              <button
                type="button"
                onClick={closeModal}
                className="font-[var(--font-pixel)] text-white opacity-60 hover:opacity-100"
                style={{ fontSize: 14, ...px, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, ...px }}>TITLE</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Note title..."
                  className="font-[var(--font-pixel)] text-black w-full px-2"
                  style={{ fontSize: 14, height: 36, border: '1px solid #000', outline: 'none', ...px, background: '#fff' }}
                />
              </div>

              {/* Tag + Color row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, ...px }}>TAG</label>
                  <select
                    value={tag}
                    onChange={e => setTag(e.target.value as NoteTag | '')}
                    className="font-[var(--font-pixel)] text-black w-full px-2"
                    style={{ fontSize: 12, height: 36, border: '1px solid #000', outline: 'none', background: '#fff', ...px }}
                  >
                    <option value="">— none —</option>
                    {NOTE_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, ...px }}>COLOR</label>
                  <div className="flex gap-2 items-center" style={{ height: 36 }}>
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setColor(c.value)}
                        style={{
                          width: 28, height: 28, flexShrink: 0,
                          background: c.bg,
                          border: color === c.value ? '2px solid #000' : '1px solid #888',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, ...px }}>CONTENT</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={6}
                  placeholder="Write your note here..."
                  className="font-[var(--font-pixel)] text-black w-full px-2 py-2 resize-none"
                  style={{ fontSize: 13, lineHeight: '20px', border: '1px solid #000', outline: 'none', ...px, background: '#fff' }}
                />
              </div>

              {error && (
                <p className="font-[var(--font-pixel)] text-black" style={{ fontSize: 11, ...px }}>⚠ {error}</p>
              )}

              {/* Action buttons — full width on mobile */}
              <div className="flex gap-2 pt-1 pb-safe">
                <button
                  type="button"
                  onClick={closeModal}
                  className="font-[var(--font-pixel)] text-black flex-1 sm:flex-none sm:px-6 active:opacity-70"
                  style={{ fontSize: 13, height: 40, border: '1px solid #000', background: '#fff', cursor: 'pointer', ...px }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="font-[var(--font-pixel)] text-white flex-1 sm:flex-none sm:px-6 active:opacity-70"
                  style={{ fontSize: 13, height: 40, border: '1px solid #000', background: '#000', cursor: saving ? 'wait' : 'pointer', ...px, opacity: saving ? 0.6 : 1 }}
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
