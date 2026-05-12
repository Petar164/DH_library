'use client'

import { NoteCard, NoteData } from './NoteCard'

const NOTES: NoteData[] = []

export function BulletinBoard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        /* Classic Mac 50% dither desktop */
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2' shape-rendering='crispEdges'%3E%3Crect width='1' height='1' fill='%23000'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23000'/%3E%3C/svg%3E")`,
        backgroundSize: '2px 2px',
        backgroundColor: '#fff',
        imageRendering: 'pixelated',
      }}
    >
      {/* Menu-bar style header */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4"
        style={{
          height: 20,
          background: '#fff',
          borderBottom: '1px solid #000',
          boxShadow: '0 1px 0 #000',
        }}
      >
        <span
          className="font-[var(--font-pixel)] text-black"
          style={{ fontSize: 13, WebkitFontSmoothing: 'none', letterSpacing: '0.05em' }}
        >
          INFOPOINT
        </span>
        <span
          className="font-[var(--font-pixel)] text-black opacity-50"
          style={{ fontSize: 11, WebkitFontSmoothing: 'none' }}
        >
          {NOTES.length} notes pinned
        </span>
        {isAdmin && (
          <button
            className="font-[var(--font-pixel)] text-black"
            style={{
              fontSize: 11,
              WebkitFontSmoothing: 'none',
              border: '1px solid #000',
              padding: '0 6px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            + New
          </button>
        )}
      </div>

      {/* Notes masonry */}
      <div className="p-8 pt-10 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
        {NOTES.map(note => (
          <div key={note.id} className="break-inside-avoid mb-10 inline-block w-full">
            <NoteCard note={note} />
          </div>
        ))}
      </div>
    </div>
  )
}
