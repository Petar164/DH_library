'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { LogOut, Upload, LayoutDashboard, User, Menu, X } from 'lucide-react'

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
    { href: '/library?view=seasons', label: 'Seasons' },
    { href: '/library?view=celebrities', label: 'Celebrities' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Brand */}
        <Link href="/library" className="text-[11px] font-bold tracking-[0.35em] uppercase text-white">
          Archive
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-[10px] tracking-[0.2em] uppercase transition-colors',
                pathname === link.href || (link.href === '/library' && pathname === '/library')
                  ? 'text-white font-semibold'
                  : 'text-white/40 hover:text-white/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {(profile.role === 'contributor' || profile.role === 'admin') && (
            <Link
              href="/upload"
              className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Upload
            </Link>
          )}

          {profile.role === 'admin' && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors"
            >
              <LayoutDashboard className="w-3 h-3" />
              Admin
            </Link>
          )}

          <Link
            href={`/profile/${profile.username}`}
            className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex-shrink-0 ring-1 ring-white/20 hover:ring-white/50 transition-all"
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover grayscale" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white/50" />
              </div>
            )}
          </Link>

          <button
            className="md:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            onClick={signOut}
            className="hidden md:flex items-center text-white/30 hover:text-white/70 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-5 flex flex-col gap-5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[10px] tracking-[0.25em] uppercase text-white/50 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {(profile.role === 'contributor' || profile.role === 'admin') && (
            <Link href="/upload" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.25em] uppercase text-white/50 hover:text-white flex items-center gap-2">
              <Upload className="w-3 h-3" /> Upload
            </Link>
          )}
          {profile.role === 'admin' && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.25em] uppercase text-white/50 hover:text-white flex items-center gap-2">
              <LayoutDashboard className="w-3 h-3" /> Admin
            </Link>
          )}
          <button onClick={signOut} className="text-[10px] tracking-[0.25em] uppercase text-white/50 hover:text-white flex items-center gap-2 text-left">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
