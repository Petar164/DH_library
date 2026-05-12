'use client'

import { CSSProperties } from 'react'

export type NoteTag =
  | 'Authentication'
  | 'Year ID'
  | 'Sizing'
  | 'History'
  | 'Dior Homme (Hedi)'
  | 'Dior Homme (KvA)'
  | 'Saint Laurent Paris (Hedi)'
  | 'Balmain'

export const NOTE_TAGS: NoteTag[] = [
  'Authentication',
  'Year ID',
  'Sizing',
  'History',
  'Dior Homme (Hedi)',
  'Dior Homme (KvA)',
  'Saint Laurent Paris (Hedi)',
  'Balmain',
]

export interface NoteData {
  id: string
  title: string
  content: string
  color?: 'white' | 'yellow' | 'gray'
  rotation?: number
  tag?: NoteTag
  animDelay?: number
  animDuration?: number
}

const BG: Record<string, string> = {
  white:  '#FFFFFF',
  yellow: '#FFFFCC',
  gray:   '#DDDDDD',
}

// Pixelated pushpin — 9×9 SVG, 1-bit style
const PIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' shape-rendering='crispEdges'%3E%3Crect x='4' y='0' width='1' height='5' fill='%23000'/%3E%3Crect x='3' y='1' width='3' height='3' fill='%23000'/%3E%3Crect x='3' y='2' width='3' height='1' fill='%23888'/%3E%3Crect x='4' y='5' width='1' height='4' fill='%23555'/%3E%3C/svg%3E`

export function NoteCard({ note }: { note: NoteData }) {
  const rot   = note.rotation ?? 0
  const bg    = BG[note.color ?? 'white']
  const delay = note.animDelay ?? 0
  const dur   = note.animDuration ?? 4

  const wrapper: CSSProperties = {
    '--rot':    `${rot}deg`,
    '--rot-hi': `${rot + 0.8}deg`,
    '--rot-lo': `${rot - 0.6}deg`,
    '--dur':    `${dur}s`,
    animationDelay: `${delay}s`,
    transformOrigin: '50% 0',
  } as CSSProperties

  return (
    <div className="note-flutter relative" style={wrapper}>

      {/* Pixel pushpin */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20"
        style={{ width: 9, height: 9, imageRendering: 'pixelated', background: `url("${PIN_SVG}") no-repeat center/contain` }}
      />

      {/* Mac window frame */}
      <div
        className="relative"
        style={{
          background: bg,
          border: '1px solid #000',
          /* hard pixel shadow — no blur */
          boxShadow: '2px 2px 0 #000',
          imageRendering: 'pixelated',
        }}
      >
        {/* Title bar — solid black, authentic Mac active window */}
        <div
          className="flex items-center gap-1.5 px-1.5"
          style={{
            height: 18,
            background: '#000',
            borderBottom: '1px solid #000',
          }}
        >
          {/* Close box */}
          <div style={{
            width: 9, height: 9, flexShrink: 0,
            border: '1px solid #fff',
            background: '#000',
            imageRendering: 'pixelated',
          }} />
          {/* Title */}
          <span
            className="font-[var(--font-pixel)] text-white truncate leading-none"
            style={{
              fontSize: 13,
              WebkitFontSmoothing: 'none',
              letterSpacing: '0.05em',
            }}
          >
            {note.title}
          </span>
        </div>

        {/* Tag pill */}
        {note.tag && (
          <div
            className="mx-2 mt-1.5 inline-block"
            style={{ border: '1px solid #000', padding: '0 4px' }}
          >
            <span
              className="font-[var(--font-pixel)] text-black"
              style={{ fontSize: 10, WebkitFontSmoothing: 'none', letterSpacing: '0.1em' }}
            >
              {note.tag.toUpperCase()}
            </span>
          </div>
        )}

        {/* Body — lined paper rules */}
        <div
          className="px-2 pt-1 pb-2"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent, transparent 19px,
              #AAAAAA 19px, #AAAAAA 20px
            )`,
            backgroundPositionY: note.tag ? '8px' : '4px',
          }}
        >
          <pre
            className="font-[var(--font-pixel)] text-black whitespace-pre-wrap break-words"
            style={{
              fontSize: 14,
              lineHeight: '20px',
              WebkitFontSmoothing: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {note.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
