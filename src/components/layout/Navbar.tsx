'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { User } from 'lucide-react'

interface NavbarProps {
  profile: Profile
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/library', label: 'Library' },
    { href: '/infopoint', label: 'Infopoint' },
    ...(profile.role === 'contributor' || profile.role === 'admin'
      ? [{ href: '/upload', label: 'Upload' }]
      : []),
    ...(profile.role === 'admin'
      ? [{ href: '/admin', label: 'Admin' }]
      : []),
  ]

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#D4D0C8',
        borderBottom: '2px solid #808080',
        boxShadow: 'inset 0 1px 0 #fff, inset -1px 0 0 #808080',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-11 flex items-center justify-between gap-4">

        {/* Brand — Mac "Apple menu" style */}
        <Link
          href="/library"
          className="font-[var(--font-pixel)] text-[17px] leading-none tracking-[0.08em] text-black px-2 py-1 hover:bg-black hover:text-white transition-none select-none whitespace-nowrap"
          style={{ fontSmooth: 'never', WebkitFontSmoothing: 'none' }}
        >
          Scan Library
        </Link>

        {/* Desktop nav — Mac menu bar items */}
        <nav className="hidden md:flex items-center h-full">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'h-full flex items-center px-3 text-[11px] font-mono tracking-wide transition-none select-none',
                pathname.startsWith(link.href) && link.href !== '/library'
                  ? 'bg-black text-white'
                  : pathname === '/library' && link.href === '/library'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black hover:text-white'
              )}
              style={{ WebkitFontSmoothing: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — profile + signout */}
        <div className="flex items-center gap-1">
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-black hover:bg-black hover:text-white transition-none"
            style={{ WebkitFontSmoothing: 'none' }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.username} className="w-5 h-5 object-cover grayscale" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <div className="w-5 h-5 bg-zinc-400 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="hidden sm:block">@{profile.username}</span>
          </Link>

          <button
            onClick={signOut}
            className="hidden md:block px-2 py-1 text-[11px] font-mono text-black hover:bg-black hover:text-white transition-none"
            style={{ WebkitFontSmoothing: 'none' }}
          >
            Sign out
          </button>

          {/* Mobile menu toggle — Mac-style */}
          <button
            className="md:hidden px-2 py-1 text-[11px] font-mono text-black hover:bg-black hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ WebkitFontSmoothing: 'none' }}
          >
            {menuOpen ? '▲ Menu' : '▼ Menu'}
          </button>
        </div>
      </div>

      {/* Mobile menu — Mac dropdown style */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col"
          style={{
            background: '#D4D0C8',
            borderTop: '1px solid #808080',
            boxShadow: 'inset 0 1px 0 #fff',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2.5 text-[11px] font-mono text-black hover:bg-black hover:text-white border-b border-[#808080]/30"
              style={{ WebkitFontSmoothing: 'none' }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="px-4 py-2.5 text-[11px] font-mono text-black hover:bg-black hover:text-white text-left"
            style={{ WebkitFontSmoothing: 'none' }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
